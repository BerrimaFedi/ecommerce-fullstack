package com.ecommerce.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendWelcomeEmail(String toEmail, String userName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Bienvenue sur notre boutique en ligne !");
        message.setText("Bonjour " + userName + ",\n\n"
                + "Votre compte a été créé avec succès. Merci de nous avoir rejoints !\n\n"
                + "Cordialement,\n"
                + "L'équipe E-commerce");
        
        mailSender.send(message);
    }

    public void sendEmailVerification(String toEmail, String userName, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String verifyUrl = "http://localhost:3000/verify-email?token=" + token;
            String html = "<div style=\"font-family:Arial,sans-serif;color:#f8f9fa;background:#09090b;padding:32px;\">"
                    + "<div style=\"max-width:600px;margin:0 auto;background:#111115;border:1px solid rgba(139,92,246,0.2);border-radius:24px;padding:32px;\">"
                    + "<h2 style=\"color:#e6e6ff;\">Bonjour " + userName + ",</h2>"
                    + "<p style=\"color:#c9c9d2;line-height:1.6;\">Merci de créer un compte sur notre boutique. Pour activer votre adresse e-mail, cliquez sur le bouton ci-dessous :</p>"
                    + "<a href=\"" + verifyUrl + "\" style=\"display:inline-block;padding:14px 26px;margin:18px 0;border-radius:999px;background:#8b5cf6;color:#fff;text-decoration:none;font-weight:700;\">Vérifier mon email</a>"
                    + "<p style=\"color:#9ca3af;font-size:0.95rem;\">Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br>" + verifyUrl + "</p>"
                    + "<p style=\"color:#c9c9d2;line-height:1.6;\">Cordialement,<br>L'équipe E-commerce</p>"
                    + "</div></div>";

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Vérifiez votre adresse e-mail");
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new IllegalStateException("Echec envoi email de vérification", e);
        }
    }

    public void sendOrderConfirmationEmail(String toEmail, String userName, Integer orderId, Double totalAmount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Confirmation de votre commande #" + orderId);
        message.setText("Bonjour " + userName + ",\n\n"
                + "Votre commande a été passée avec succès. \n"
                + "Numéro de commande : " + orderId + "\n"
                + "Montant total : " + totalAmount + " €\n\n"
                + "Merci pour votre achat !\n\n"
                + "Cordialement,\n"
                + "L'équipe E-commerce");
        
        mailSender.send(message);
    }
}
