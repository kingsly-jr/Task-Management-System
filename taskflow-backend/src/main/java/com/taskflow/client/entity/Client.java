package com.taskflow.client.entity;

import com.taskflow.user.entity.User;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;


@Entity
@Table(name = "clients")
@EntityListeners(AuditingEntityListener.class)
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "client_id", updatable = false, nullable = false)
    private Long clientId;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "company_name", nullable = false, length = 150)
    private String companyName;

    @Column(name = "contact_person", nullable = false, length = 100)
    private String contactPerson;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    public Client() {}

    public Client(Long clientId, User user, String companyName, String contactPerson, String email,
                  String phone, String address, String country, String status,
                  boolean isDeleted, Instant deletedAt, Instant createdAt, Instant updatedAt) {
        this.clientId = clientId;
        this.user = user;
        this.companyName = companyName;
        this.contactPerson = contactPerson;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.country = country;
        this.status = status != null ? status : "ACTIVE";
        this.isDeleted = isDeleted;
        this.deletedAt = deletedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static ClientBuilder builder() {
        return new ClientBuilder();
    }

    public static class ClientBuilder {
        private Long clientId;
        private User user;
        private String companyName;
        private String contactPerson;
        private String email;
        private String phone;
        private String address;
        private String country;
        private String status = "ACTIVE";
        private boolean isDeleted = false;
        private Instant deletedAt;
        private Instant createdAt;
        private Instant updatedAt;

        public ClientBuilder clientId(Long clientId) { this.clientId = clientId; return this; }
        public ClientBuilder user(User user) { this.user = user; return this; }
        public ClientBuilder companyName(String companyName) { this.companyName = companyName; return this; }
        public ClientBuilder contactPerson(String contactPerson) { this.contactPerson = contactPerson; return this; }
        public ClientBuilder email(String email) { this.email = email; return this; }
        public ClientBuilder phone(String phone) { this.phone = phone; return this; }
        public ClientBuilder address(String address) { this.address = address; return this; }
        public ClientBuilder country(String country) { this.country = country; return this; }
        public ClientBuilder status(String status) { this.status = status; return this; }
        public ClientBuilder isDeleted(boolean isDeleted) { this.isDeleted = isDeleted; return this; }
        public ClientBuilder deletedAt(Instant deletedAt) { this.deletedAt = deletedAt; return this; }
        public ClientBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public ClientBuilder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public Client build() {
            return new Client(clientId, user, companyName, contactPerson, email, phone, address, country, status, isDeleted, deletedAt, createdAt, updatedAt);
        }
    }

    public Long getClientId() { return clientId; }
    public void setClientId(Long clientId) { this.clientId = clientId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
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
    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }
    public Instant getDeletedAt() { return deletedAt; }
    public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
