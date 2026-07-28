package employee_management_system_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import employee_management_system_backend.entity.Employee;
import employee_management_system_backend.entity.Holiday;
import employee_management_system_backend.entity.Leave;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendWelcomeEmail(Employee employee, String temporaryPassword) {

        String content = ""
                + "<p style='margin:0 0 14px;'>Hi <b>" + escape(employee.getName()) + "</b>,</p>"
                + "<p style='margin:0 0 18px;color:#475569;'>Welcome to the Employee Management System. Your employee account is ready.</p>"
                + infoGrid(new String[][] {
                        {"Login Email", escape(employee.getEmail())},
                        {"Temporary Password", escape(temporaryPassword)},
                        {"Department", escape(valueOrDash(employee.getDepartment()))},
                        {"Designation", escape(valueOrDash(employee.getDesignation()))}
                })
                + highlightBox("Next step", "Please login and reset your password after your first sign in.");

        sendHtmlEmail(
                employee.getEmail(),
                "Welcome to EMS",
                "Welcome aboard",
                "Your EMS account has been created",
                content,
                "#2F80ED");
    }

    public void sendPasswordResetOtp(String email, String otp, int expiryMinutes) {

        String content = ""
                + "<p style='margin:0 0 14px;'>Hello,</p>"
                + "<p style='margin:0 0 18px;color:#475569;'>Use the OTP below to reset your EMS password.</p>"
                + "<div style='letter-spacing:8px;font-size:32px;font-weight:800;text-align:center;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;padding:18px 12px;color:#0F172A;'>"
                + escape(otp)
                + "</div>"
                + "<p style='margin:18px 0 0;color:#64748B;'>This OTP is valid for <b>"
                + expiryMinutes
                + " minutes</b>.</p>"
                + warningBox("Security note", "If you did not request a password reset, you can safely ignore this email.");

        sendHtmlEmail(
                email,
                "EMS Password Reset OTP",
                "Password reset",
                "Your secure OTP is ready",
                content,
                "#8E44AD");
    }

    public void sendPasswordResetConfirmation(String email) {

        String content = ""
                + "<p style='margin:0 0 14px;'>Hello,</p>"
                + "<p style='margin:0 0 18px;color:#475569;'>Your EMS password has been reset successfully.</p>"
                + highlightBox("Account updated", "You can now login with your new password.")
                + warningBox("Not you?", "If you did not make this change, contact your administrator immediately.");

        sendHtmlEmail(
                email,
                "EMS Password Reset Successful",
                "Password changed",
                "Your account password was updated",
                content,
                "#11998e");
    }

    public void sendLeaveStatusEmail(Employee employee, Leave leave) {

        boolean approved = "Approved".equalsIgnoreCase(leave.getStatus());
        String accentColor = approved ? "#27AE60" : "#EB5757";
        String statusCopy = approved
                ? "Good news. Your leave request has been approved."
                : "Your leave request has been rejected.";

        String content = ""
                + "<p style='margin:0 0 14px;'>Hi <b>" + escape(employee.getName()) + "</b>,</p>"
                + "<p style='margin:0 0 18px;color:#475569;'>" + statusCopy + "</p>"
                + statusPill(leave.getStatus(), accentColor)
                + infoGrid(new String[][] {
                        {"Leave Type", escape(leave.getLeaveType())},
                        {"Start Date", String.valueOf(leave.getStartDate())},
                        {"End Date", String.valueOf(leave.getEndDate())}
                });

        sendHtmlEmail(
                employee.getEmail(),
                "Leave Request " + leave.getStatus(),
                "Leave " + leave.getStatus(),
                "Your leave request status changed",
                content,
                accentColor);
    }

    public void sendHolidayAnnouncement(Employee employee, Holiday holiday) {

        String content = ""
                + "<p style='margin:0 0 14px;'>Hi <b>" + escape(employee.getName()) + "</b>,</p>"
                + "<p style='margin:0 0 18px;color:#475569;'>A holiday has been added to the company calendar.</p>"
                + infoGrid(new String[][] {
                        {"Holiday", escape(holiday.getName())},
                        {"Date", String.valueOf(holiday.getHolidayDate())},
                        {"Type", escape(holiday.getType())}
                })
                + (holiday.getDescription() == null || holiday.getDescription().isBlank()
                        ? ""
                        : highlightBox("Note", escape(holiday.getDescription())));

        sendHtmlEmail(
                employee.getEmail(),
                "Holiday Announcement: " + holiday.getName(),
                "Holiday announced",
                holiday.getName(),
                content,
                "#F2994A");
    }

    private void sendHtmlEmail(
            String to,
            String subject,
            String eyebrow,
            String title,
            String content,
            String accentColor) {

        if (!mailEnabled) {
            System.out.println("Mail disabled. Skipping email to " + to
                    + " with subject: " + subject);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(buildTemplate(eyebrow, title, content, accentColor), true);

            mailSender.send(message);
        } catch (Exception ex) {
            System.out.println("Failed to send email to " + to + ": "
                    + ex.getMessage());
        }
    }

    private String buildTemplate(
            String eyebrow,
            String title,
            String content,
            String accentColor) {

        return "<!doctype html>"
                + "<html><body style='margin:0;background:#EEF2F7;font-family:Arial,Helvetica,sans-serif;color:#0F172A;'>"
                + "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='background:#EEF2F7;padding:28px 12px;'>"
                + "<tr><td align='center'>"
                + "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='max-width:620px;background:#FFFFFF;border-radius:18px;overflow:hidden;box-shadow:0 12px 32px rgba(15,23,42,0.12);'>"
                + "<tr><td style='background:#0F2027;background:linear-gradient(135deg,#0F2027,#203A43,#2C5364);padding:30px 28px;'>"
                + "<div style='font-size:12px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;color:" + accentColor + ";margin-bottom:10px;'>"
                + escape(eyebrow)
                + "</div>"
                + "<div style='font-size:30px;line-height:36px;font-weight:900;color:#FFFFFF;'>"
                + escape(title)
                + "</div>"
                + "</td></tr>"
                + "<tr><td style='padding:28px;'>"
                + content
                + "</td></tr>"
                + "<tr><td style='padding:18px 28px;background:#F8FAFC;border-top:1px solid #E2E8F0;'>"
                + "<div style='font-size:12px;line-height:18px;color:#64748B;'>This is an automated message from EMS. Please do not reply to this email.</div>"
                + "</td></tr>"
                + "</table>"
                + "<div style='font-size:12px;color:#94A3B8;margin-top:16px;'>Employee Management System</div>"
                + "</td></tr></table>"
                + "</body></html>";
    }

    private String infoGrid(String[][] rows) {

        StringBuilder builder = new StringBuilder();
        builder.append("<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border:1px solid #E2E8F0;border-radius:14px;overflow:hidden;margin:18px 0;'>");

        for (String[] row : rows) {
            builder.append("<tr>")
                    .append("<td style='background:#F8FAFC;border-bottom:1px solid #E2E8F0;padding:13px 14px;font-size:13px;color:#64748B;font-weight:700;width:38%;'>")
                    .append(row[0])
                    .append("</td>")
                    .append("<td style='border-bottom:1px solid #E2E8F0;padding:13px 14px;font-size:14px;color:#0F172A;font-weight:800;'>")
                    .append(row[1])
                    .append("</td>")
                    .append("</tr>");
        }

        builder.append("</table>");
        return builder.toString();
    }

    private String highlightBox(String title, String text) {

        return "<div style='background:#EFF6FF;border-left:4px solid #2F80ED;border-radius:12px;padding:14px 16px;margin-top:18px;'>"
                + "<div style='font-size:13px;font-weight:900;color:#1E40AF;margin-bottom:4px;'>"
                + title
                + "</div>"
                + "<div style='font-size:14px;line-height:20px;color:#334155;'>"
                + text
                + "</div>"
                + "</div>";
    }

    private String warningBox(String title, String text) {

        return "<div style='background:#FFF7ED;border-left:4px solid #F2994A;border-radius:12px;padding:14px 16px;margin-top:18px;'>"
                + "<div style='font-size:13px;font-weight:900;color:#9A3412;margin-bottom:4px;'>"
                + title
                + "</div>"
                + "<div style='font-size:14px;line-height:20px;color:#7C2D12;'>"
                + text
                + "</div>"
                + "</div>";
    }

    private String statusPill(String status, String color) {

        return "<div style='display:inline-block;background:" + color + ";color:#FFFFFF;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:900;margin-bottom:16px;'>"
                + escape(status)
                + "</div>";
    }

    private String valueOrDash(String value) {

        return value == null || value.isBlank() ? "-" : value;
    }

    private String escape(String value) {

        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
