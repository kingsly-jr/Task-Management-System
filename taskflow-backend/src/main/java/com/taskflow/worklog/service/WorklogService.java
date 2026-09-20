package com.taskflow.worklog.service;

import com.taskflow.common.exception.BadRequestException;
import com.taskflow.common.exception.ResourceNotFoundException;
import com.taskflow.common.exception.UnauthorizedException;
import com.taskflow.notification.service.NotificationService;
import com.taskflow.project.entity.Project;
import com.taskflow.project.repository.ProjectMemberRepository;
import com.taskflow.project.repository.ProjectRepository;
import com.taskflow.security.UserPrincipal;
import com.taskflow.task.entity.Task;
import com.taskflow.task.repository.TaskRepository;
import com.taskflow.role.entity.RoleCategory;
import com.taskflow.user.entity.User;
import com.taskflow.user.repository.UserRepository;
import com.taskflow.worklog.dto.WorklogDto;
import com.taskflow.worklog.entity.Worklog;
import com.taskflow.worklog.repository.WorklogRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WorklogService {

    private final WorklogRepository worklogRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public WorklogService(WorklogRepository worklogRepository,
                          ProjectRepository projectRepository,
                          ProjectMemberRepository projectMemberRepository,
                          TaskRepository taskRepository,
                          UserRepository userRepository,
                          NotificationService notificationService) {
        this.worklogRepository = worklogRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public WorklogDto.WorklogResponse createWorklog(WorklogDto.CreateWorklogRequest request) {
        UserPrincipal currentUser = getCurrentUserPrincipal();
        User employee = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Project project = projectRepository.findById(request.getProjectId())
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));

        // Authorization check: User must be Admin, PM, or assigned team member
        verifyWorklogLoggingAccess(project, currentUser);

        Task task = null;
        if (request.getTaskId() != null) {
            task = taskRepository.findById(request.getTaskId())
                    .filter(t -> !t.isDeleted())
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + request.getTaskId()));

            if (!task.getProject().getProjectId().equals(project.getProjectId())) {
                throw new BadRequestException("Task does not belong to the specified project");
            }
        }

        if (request.getHoursSpent() == null || request.getHoursSpent().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Hours spent must be greater than zero");
        }

        Worklog worklog = Worklog.builder()
                .project(project)
                .task(task)
                .user(employee)
                .logDate(request.getLogDate() != null ? request.getLogDate() : LocalDate.now())
                .hoursSpent(request.getHoursSpent().setScale(2, RoundingMode.HALF_UP))
                .description(request.getDescription().trim())
                .isBillable(request.isBillable())
                .status("SUBMITTED")
                .isDeleted(false)
                .build();

        Worklog saved = worklogRepository.save(worklog);
        return mapToDto(saved);
    }

    @Transactional
    public WorklogDto.WorklogResponse updateWorklog(Long worklogId, WorklogDto.UpdateWorklogRequest request) {
        UserPrincipal currentUser = getCurrentUserPrincipal();
        Worklog worklog = worklogRepository.findById(worklogId)
                .filter(w -> !w.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Worklog not found with id: " + worklogId));

        if (!worklog.getUser().getUserId().equals(currentUser.getId()) && !"ADMIN".equalsIgnoreCase(currentUser.getRoleCode())) {
            throw new AccessDeniedException("You do not have permission to edit this worklog");
        }

        if ("APPROVED".equalsIgnoreCase(worklog.getStatus())) {
            throw new BadRequestException("Cannot edit an approved timesheet worklog");
        }

        if (request.getTaskId() != null) {
            Task task = taskRepository.findById(request.getTaskId())
                    .filter(t -> !t.isDeleted())
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + request.getTaskId()));
            if (!task.getProject().getProjectId().equals(worklog.getProject().getProjectId())) {
                throw new BadRequestException("Task does not belong to the worklog project");
            }
            worklog.setTask(task);
        }

        if (request.getLogDate() != null) {
            worklog.setLogDate(request.getLogDate());
        }

        if (request.getHoursSpent() != null) {
            if (request.getHoursSpent().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Hours spent must be greater than zero");
            }
            worklog.setHoursSpent(request.getHoursSpent().setScale(2, RoundingMode.HALF_UP));
        }

        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            worklog.setDescription(request.getDescription().trim());
        }

        if (request.getIsBillable() != null) {
            worklog.setBillable(request.getIsBillable());
        }

        // Reset to SUBMITTED if it was previously REJECTED
        if ("REJECTED".equalsIgnoreCase(worklog.getStatus())) {
            worklog.setStatus("SUBMITTED");
        }

        worklog.setUpdatedAt(Instant.now());
        Worklog saved = worklogRepository.save(worklog);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteWorklog(Long worklogId) {
        UserPrincipal currentUser = getCurrentUserPrincipal();
        Worklog worklog = worklogRepository.findById(worklogId)
                .filter(w -> !w.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Worklog not found with id: " + worklogId));

        if (!worklog.getUser().getUserId().equals(currentUser.getId()) && !"ADMIN".equalsIgnoreCase(currentUser.getRoleCode())) {
            throw new AccessDeniedException("You do not have permission to delete this worklog");
        }

        if ("APPROVED".equalsIgnoreCase(worklog.getStatus())) {
            throw new BadRequestException("Cannot delete an approved timesheet worklog");
        }

        worklog.setDeleted(true);
        worklog.setUpdatedAt(Instant.now());
        worklogRepository.save(worklog);
    }

    @Transactional(readOnly = true)
    public List<WorklogDto.WorklogResponse> getMyWorklogs(LocalDate startDate, LocalDate endDate) {
        UserPrincipal currentUser = getCurrentUserPrincipal();
        List<Worklog> list;
        if (startDate != null && endDate != null) {
            list = worklogRepository.findByUserAndDateRange(currentUser.getId(), startDate, endDate);
        } else {
            list = worklogRepository.findByUserOrderByDate(currentUser.getId());
        }

        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorklogDto.TimesheetSummaryResponse getMyTimesheetSummary() {
        UserPrincipal currentUser = getCurrentUserPrincipal();
        List<Worklog> list = worklogRepository.findByUserOrderByDate(currentUser.getId());

        BigDecimal total = BigDecimal.ZERO;
        BigDecimal billable = BigDecimal.ZERO;
        BigDecimal nonBillable = BigDecimal.ZERO;
        BigDecimal approved = BigDecimal.ZERO;
        BigDecimal pending = BigDecimal.ZERO;
        BigDecimal rejected = BigDecimal.ZERO;

        for (Worklog w : list) {
            BigDecimal hours = w.getHoursSpent() != null ? w.getHoursSpent() : BigDecimal.ZERO;
            total = total.add(hours);
            if (w.isBillable()) {
                billable = billable.add(hours);
            } else {
                nonBillable = nonBillable.add(hours);
            }

            if ("APPROVED".equalsIgnoreCase(w.getStatus())) {
                approved = approved.add(hours);
            } else if ("REJECTED".equalsIgnoreCase(w.getStatus())) {
                rejected = rejected.add(hours);
            } else {
                pending = pending.add(hours);
            }
        }

        return new WorklogDto.TimesheetSummaryResponse(total, billable, nonBillable, approved, pending, rejected);
    }

    @Transactional(readOnly = true)
    public List<WorklogDto.WorklogResponse> getProjectWorklogs(Long projectId, String status, Long userId) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectTimesheetAccess(project, currentUser);

        List<Worklog> list;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            list = worklogRepository.findByProjectAndStatus(projectId, status.toUpperCase().trim());
        } else {
            list = worklogRepository.findByProject(projectId);
        }

        if (userId != null) {
            list = list.stream().filter(w -> w.getUser().getUserId().equals(userId)).collect(Collectors.toList());
        }

        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public WorklogDto.WorklogResponse reviewWorklog(Long worklogId, WorklogDto.ReviewWorklogRequest request) {
        UserPrincipal currentUser = getCurrentUserPrincipal();
        Worklog worklog = worklogRepository.findById(worklogId)
                .filter(w -> !w.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Worklog not found with id: " + worklogId));

        Project project = worklog.getProject();
        if (!"ADMIN".equalsIgnoreCase(currentUser.getRoleCode())) {
            if (project.getProjectManager() == null || !project.getProjectManager().getUserId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Only the Project Manager or Admin can review this worklog");
            }
        }

        String targetStatus = request.getStatus().toUpperCase().trim();
        if (!"APPROVED".equals(targetStatus) && !"REJECTED".equals(targetStatus)) {
            throw new BadRequestException("Review status must be either APPROVED or REJECTED");
        }

        User reviewer = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer user not found"));

        worklog.setStatus(targetStatus);
        worklog.setReviewedBy(reviewer);
        worklog.setReviewedAt(Instant.now());
        worklog.setReviewNotes(request.getReviewNotes() != null ? request.getReviewNotes().trim() : null);
        worklog.setUpdatedAt(Instant.now());

        Worklog saved = worklogRepository.save(worklog);

        // Notify employee
        String hoursStr = saved.getHoursSpent() + "h";
        if ("REJECTED".equals(targetStatus)) {
            String reason = saved.getReviewNotes() != null && !saved.getReviewNotes().isBlank()
                    ? saved.getReviewNotes()
                    : "No reason provided";
            notificationService.createNotification(
                    worklog.getUser(),
                    reviewer,
                    "Timesheet rejected for " + project.getProjectCode(),
                    "Your " + hoursStr + " worklog on " + worklog.getLogDate() + " was rejected: " + reason,
                    "WORKLOG_REJECTED",
                    "/member/timesheets"
            );
        } else {
            notificationService.createNotification(
                    worklog.getUser(),
                    reviewer,
                    "Timesheet approved for " + project.getProjectCode(),
                    "Your " + hoursStr + " worklog on " + worklog.getLogDate() + " has been approved.",
                    "WORKLOG_APPROVED",
                    "/member/timesheets"
            );
        }

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public WorklogDto.ProductivityReportResponse getProductivityReport(LocalDate startDate, LocalDate endDate) {
        List<Worklog> list = (startDate != null && endDate != null)
                ? worklogRepository.findByDateRange(startDate, endDate)
                : worklogRepository.findAllActive();

        BigDecimal totalHours = BigDecimal.ZERO;
        BigDecimal billableHours = BigDecimal.ZERO;
        Set<Long> contributorIds = new HashSet<>();
        Set<Long> projectIds = new HashSet<>();

        // Group by RoleCategory / Department
        Map<String, DepartmentAccumulator> deptMap = new LinkedHashMap<>();
        // Group by Employee
        Map<Long, ContributorAccumulator> contribMap = new LinkedHashMap<>();

        for (Worklog w : list) {
            BigDecimal hours = w.getHoursSpent() != null ? w.getHoursSpent() : BigDecimal.ZERO;
            totalHours = totalHours.add(hours);
            if (w.isBillable()) {
                billableHours = billableHours.add(hours);
            }

            contributorIds.add(w.getUser().getUserId());
            projectIds.add(w.getProject().getProjectId());

            // Dept rollup
            RoleCategory rc = w.getUser().getRoleCategory();
            String code = rc != null ? rc.getRoleCategoryCode() : "GENERAL";
            String name = rc != null ? rc.getRoleCategoryName() : "General";
            deptMap.computeIfAbsent(code, k -> new DepartmentAccumulator(code, name)).add(hours, w.getUser().getUserId());

            // Contributor rollup
            contribMap.computeIfAbsent(w.getUser().getUserId(), k -> new ContributorAccumulator(
                    w.getUser().getUserId(),
                    w.getUser().getFirstName() + " " + w.getUser().getLastName(),
                    rc != null ? rc.getRoleCategoryName() : "General"
            )).add(hours, w.isBillable(), "APPROVED".equalsIgnoreCase(w.getStatus()));
        }

        double billableRate = totalHours.compareTo(BigDecimal.ZERO) > 0
                ? billableHours.divide(totalHours, 4, RoundingMode.HALF_UP).doubleValue() * 100
                : 0.0;

        List<WorklogDto.DepartmentHoursSummary> deptList = deptMap.values().stream()
                .map(d -> new WorklogDto.DepartmentHoursSummary(d.code, d.name, d.totalHours, d.employees.size()))
                .sorted((a, b) -> b.getTotalHours().compareTo(a.getTotalHours()))
                .collect(Collectors.toList());

        List<WorklogDto.ContributorSummary> topContributors = contribMap.values().stream()
                .map(c -> new WorklogDto.ContributorSummary(c.userId, c.userName, c.roleCategory, c.totalHours, c.billableHours, c.approvedHours))
                .sorted((a, b) -> b.getTotalHours().compareTo(a.getTotalHours()))
                .collect(Collectors.toList());

        return new WorklogDto.ProductivityReportResponse(
                totalHours,
                Math.round(billableRate * 10.0) / 10.0,
                contributorIds.size(),
                projectIds.size(),
                deptList,
                topContributors
        );
    }

    @Transactional(readOnly = true)
    public String generateTimesheetsCsv(LocalDate startDate, LocalDate endDate) {
        List<Worklog> list = (startDate != null && endDate != null)
                ? worklogRepository.findByDateRange(startDate, endDate)
                : worklogRepository.findAllActive();

        StringBuilder sb = new StringBuilder();
        sb.append("Worklog ID,Date,Employee,Department,Project Code,Project Name,Task Code,Task Title,Hours Spent,Billable,Status,Reviewed By,Reviewed At,Description\n");

        for (Worklog w : list) {
            String worklogId = w.getWorklogId().toString();
            String date = w.getLogDate().toString();
            String emp = escapeCsv(w.getUser().getFirstName() + " " + w.getUser().getLastName());
            String dept = escapeCsv(w.getUser().getRoleCategory() != null ? w.getUser().getRoleCategory().getRoleCategoryName() : "General");
            String projCode = escapeCsv(w.getProject().getProjectCode());
            String projName = escapeCsv(w.getProject().getProjectName());
            String taskCode = w.getTask() != null ? escapeCsv(w.getTask().getTaskCode()) : "";
            String taskTitle = w.getTask() != null ? escapeCsv(w.getTask().getTitle()) : "";
            String hours = w.getHoursSpent().toString();
            String billable = w.isBillable() ? "YES" : "NO";
            String status = w.getStatus();
            String revBy = w.getReviewedBy() != null ? escapeCsv(w.getReviewedBy().getFirstName() + " " + w.getReviewedBy().getLastName()) : "";
            String revAt = w.getReviewedAt() != null ? w.getReviewedAt().toString() : "";
            String desc = escapeCsv(w.getDescription());

            sb.append(String.join(",", worklogId, date, emp, dept, projCode, projName, taskCode, taskTitle, hours, billable, status, revBy, revAt, desc))
              .append("\n");
        }

        return sb.toString();
    }

    private String escapeCsv(String val) {
        if (val == null) return "\"\"";
        String escaped = val.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }

    private void verifyWorklogLoggingAccess(Project project, UserPrincipal currentUser) {
        String role = currentUser.getRoleCode();
        if ("ADMIN".equalsIgnoreCase(role)) return;

        if ("PROJECT_MANAGER".equalsIgnoreCase(role)) {
            if (project.getProjectManager() != null && project.getProjectManager().getUserId().equals(currentUser.getId())) {
                return;
            }
        }

        boolean isMember = projectMemberRepository.existsByProject_ProjectIdAndUser_UserIdAndStatus(
                project.getProjectId(), currentUser.getId(), "ACTIVE");
        if (!isMember) {
            throw new AccessDeniedException("You are not an active team member of this project");
        }
    }

    private void verifyProjectTimesheetAccess(Project project, UserPrincipal currentUser) {
        String role = currentUser.getRoleCode();
        if ("ADMIN".equalsIgnoreCase(role)) return;

        if ("PROJECT_MANAGER".equalsIgnoreCase(role)) {
            if (project.getProjectManager() != null && project.getProjectManager().getUserId().equals(currentUser.getId())) {
                return;
            }
        }

        throw new AccessDeniedException("Only the project manager or system admin can view timesheets for this project");
    }

    private UserPrincipal getCurrentUserPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new UnauthorizedException("User not authenticated");
        }
        return (UserPrincipal) auth.getPrincipal();
    }

    private WorklogDto.WorklogResponse mapToDto(Worklog w) {
        String roleCat = w.getUser().getRoleCategory() != null ? w.getUser().getRoleCategory().getRoleCategoryName() : "General";
        String revByName = w.getReviewedBy() != null ? w.getReviewedBy().getFirstName() + " " + w.getReviewedBy().getLastName() : null;

        return new WorklogDto.WorklogResponse(
                w.getWorklogId(),
                w.getProject().getProjectId(),
                w.getProject().getProjectCode(),
                w.getProject().getProjectName(),
                w.getTask() != null ? w.getTask().getTaskId() : null,
                w.getTask() != null ? w.getTask().getTaskCode() : null,
                w.getTask() != null ? w.getTask().getTitle() : null,
                w.getUser().getUserId(),
                w.getUser().getFirstName() + " " + w.getUser().getLastName(),
                roleCat,
                w.getLogDate(),
                w.getHoursSpent(),
                w.getDescription(),
                w.isBillable(),
                w.getStatus(),
                w.getReviewedBy() != null ? w.getReviewedBy().getUserId() : null,
                revByName,
                w.getReviewedAt(),
                w.getReviewNotes(),
                w.getCreatedAt()
        );
    }

    private static class DepartmentAccumulator {
        final String code;
        final String name;
        BigDecimal totalHours = BigDecimal.ZERO;
        final Set<Long> employees = new HashSet<>();

        DepartmentAccumulator(String code, String name) {
            this.code = code;
            this.name = name;
        }

        void add(BigDecimal h, Long uid) {
            this.totalHours = this.totalHours.add(h);
            this.employees.add(uid);
        }
    }

    private static class ContributorAccumulator {
        final Long userId;
        final String userName;
        final String roleCategory;
        BigDecimal totalHours = BigDecimal.ZERO;
        BigDecimal billableHours = BigDecimal.ZERO;
        BigDecimal approvedHours = BigDecimal.ZERO;

        ContributorAccumulator(Long userId, String userName, String roleCategory) {
            this.userId = userId;
            this.userName = userName;
            this.roleCategory = roleCategory;
        }

        void add(BigDecimal h, boolean billable, boolean approved) {
            this.totalHours = this.totalHours.add(h);
            if (billable) {
                this.billableHours = this.billableHours.add(h);
            }
            if (approved) {
                this.approvedHours = this.approvedHours.add(h);
            }
        }
    }
}
