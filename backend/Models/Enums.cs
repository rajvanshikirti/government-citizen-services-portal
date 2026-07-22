namespace GovernmentCitizenServices.Api.Models
{
    public enum Role
    {
        CITIZEN,
        OFFICER,
        ADMIN
    }

    public enum ApplicationStatus
    {
        DRAFT,
        SUBMITTED,
        UNDER_REVIEW,
        APPROVED,
        REJECTED,
        COMPLETED
    }

    public enum NotificationType
    {
        INFO,
        SUCCESS,
        WARNING,
        ERROR
    }
}
