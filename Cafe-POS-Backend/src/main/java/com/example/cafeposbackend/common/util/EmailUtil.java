package com.example.cafeposbackend.common.util;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class EmailUtil {
  private final ObjectProvider<JavaMailSender> mailSender;
  private final String from;

  public EmailUtil(
      ObjectProvider<JavaMailSender> mailSender,
      @Value("${spring.mail.username:no-reply@cafepos.local}") String from) {
    this.mailSender = mailSender;
    this.from = from;
  }

  public void send(String to, String subject, String body) {
    JavaMailSender sender = mailSender.getIfAvailable();
    if (sender == null) {
      throw new IllegalStateException("SMTP is not configured");
    }
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(from);
    message.setTo(to);
    message.setSubject(subject);
    message.setText(body);
    sender.send(message);
  }
}
