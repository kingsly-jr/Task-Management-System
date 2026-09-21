package com.taskflow.client.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public class ClientDto {

    public static class CreateClientRequest {
        @NotBlank(message = "Company name is required")
        @Size(min = 2, max = 150)
        private String companyName;

        @NotBlank(message = "Contact person is required")
        @Size(min = 2, max = 100)
        private String contactPerson;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String phone;
        private String address;
        private String country;
        private String temporaryPassword;

        public CreateClientRequest() {}

        public CreateClientRequest(String companyName, String contactPerson, String email,
                                   String phone, String address, String country, String temporaryPassword) {
            this.companyName = companyName;
            this.contactPerson = contactPerson;
            this.email = email;
            this.phone = phone;
            this.address = address;
            this.country = country;
            this.temporaryPassword = temporaryPassword;
        }

        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        public String getContactPerson() { return contactPerson; }
        public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public String getTemporaryPassword() { return temporaryPassword; }
        public void setTemporaryPassword(String temporaryPassword) { this.temporaryPassword = temporaryPassword; }
    }

    public static class UpdateClientRequest {
        @NotBlank(message = "Company name is required")
        private String companyName;

        @NotBlank(message = "Contact person is required")
        private String contactPerson;

        private String phone;
        private String address;
        private String country;
        private String status;

        public UpdateClientRequest() {}

        public UpdateClientRequest(String companyName, String contactPerson, String phone, String address, String country, String status) {
            this.companyName = companyName;
            this.contactPerson = contactPerson;
            this.phone = phone;
            this.address = address;
            this.country = country;
            this.status = status;
        }

        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        public String getContactPerson() { return contactPerson; }
        public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class ProvisionAccountRequest {
        @NotBlank(message = "Password cannot be blank")
        private String password;

        public ProvisionAccountRequest() {}

        public ProvisionAccountRequest(String password) {
            this.password = password;
        }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class ClientResponse {
        private Long clientId;
        private String companyName;
        private String contactPerson;
        private String email;
        private String phone;
        private String address;
        private String country;
        private String status;
        private Long userId;
        private boolean hasPortalAccount;
        private String temporaryPassword; // Only returned on creation or reset
        private long activeProjectsCount;
        private Instant createdAt;
        private Instant updatedAt;

        public ClientResponse() {}

        public ClientResponse(Long clientId, String companyName, String contactPerson, String email,
                              String phone, String address, String country, String status,
                              Long userId, String temporaryPassword, long activeProjectsCount,
                              Instant createdAt, Instant updatedAt) {
            this.clientId = clientId;
            this.companyName = companyName;
            this.contactPerson = contactPerson;
            this.email = email;
            this.phone = phone;
            this.address = address;
            this.country = country;
            this.status = status;
            this.userId = userId;
            this.hasPortalAccount = (userId != null);
            this.temporaryPassword = temporaryPassword;
            this.activeProjectsCount = activeProjectsCount;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
        }

        public Long getClientId() { return clientId; }
        public void setClientId(Long clientId) { this.clientId = clientId; }
        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }
        public String getContactPerson() { return contactPerson; }
        public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) {
            this.userId = userId;
            this.hasPortalAccount = (userId != null);
        }
        public boolean isHasPortalAccount() { return hasPortalAccount; }
        public boolean getHasPortalAccount() { return hasPortalAccount; }
        public void setHasPortalAccount(boolean hasPortalAccount) { this.hasPortalAccount = hasPortalAccount; }
        public String getTemporaryPassword() { return temporaryPassword; }
        public void setTemporaryPassword(String temporaryPassword) { this.temporaryPassword = temporaryPassword; }
        public long getActiveProjectsCount() { return activeProjectsCount; }
        public void setActiveProjectsCount(long activeProjectsCount) { this.activeProjectsCount = activeProjectsCount; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public Instant getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class ClientPageResponse {
        private List<ClientResponse> content;
        private int pageNo;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean last;

        public ClientPageResponse() {}
        public ClientPageResponse(List<ClientResponse> content, int pageNo, int pageSize, long totalElements, int totalPages, boolean last) {
            this.content = content;
            this.pageNo = pageNo;
            this.pageSize = pageSize;
            this.totalElements = totalElements;
            this.totalPages = totalPages;
            this.last = last;
        }

        public List<ClientResponse> getContent() { return content; }
        public void setContent(List<ClientResponse> content) { this.content = content; }
        public int getPageNo() { return pageNo; }
        public void setPageNo(int pageNo) { this.pageNo = pageNo; }
        public int getPageSize() { return pageSize; }
        public void setPageSize(int pageSize) { this.pageSize = pageSize; }
        public long getTotalElements() { return totalElements; }
        public void setTotalElements(long totalElements) { this.totalElements = totalElements; }
        public int getTotalPages() { return totalPages; }
        public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
        public boolean isLast() { return last; }
        public void setLast(boolean last) { this.last = last; }
    }
}
