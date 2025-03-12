<?php
/**
 * Contact Form Handler with Direct SMTP
 * 
 * This script sends emails directly to Gmail/Google Workspace via SMTP authentication,
 * completely bypassing Bluehost's mail system.
 */

// Set JSON response type
header('Content-Type: application/json');

// Set up error logging
$log_file = 'form_submissions.log';
$timestamp = date('Y-m-d H:i:s');
file_put_contents($log_file, "$timestamp - Form submission received\n", FILE_APPEND);

// Load SMTP settings from config file
define('SECURE_ACCESS', true);
$smtp_settings = @include('smtp-config.php');

if (!$smtp_settings) {
    file_put_contents($log_file, "$timestamp - ERROR: Could not load SMTP configuration\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server configuration error. Please try again later or contact us directly.']);
    exit;
}

// Get form data
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$projectType = isset($_POST['project-type']) ? trim($_POST['project-type']) : '';
$timeline = isset($_POST['timeline']) ? trim($_POST['timeline']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

// Validate inputs
$errors = [];
if (empty($name)) $errors[] = 'Name is required';
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Valid email is required';
if (empty($projectType)) $errors[] = 'Project type is required';
if (empty($timeline)) $errors[] = 'Timeline is required';
if (empty($message)) $errors[] = 'Message is required';

if (!empty($errors)) {
    file_put_contents($log_file, "$timestamp - Validation errors: " . implode(', ', $errors) . "\n", FILE_APPEND);
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please correct the following: ' . implode(', ', $errors)]);
    exit;
}

// Prepare email content
$to = $smtp_settings['to_email'];
$subject = "New Project Inquiry from $name";

// Create email content
$htmlMessage = '
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: #0066FF; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; }
        .footer { font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Project Inquiry</h1>
        </div>
        <div class="content">
            <div class="field">
                <span class="label">Name:</span> ' . htmlspecialchars($name) . '
            </div>
            <div class="field">
                <span class="label">Email:</span> ' . htmlspecialchars($email) . '
            </div>
            <div class="field">
                <span class="label">Project Type:</span> ' . htmlspecialchars($projectType) . '
            </div>
            <div class="field">
                <span class="label">Timeline:</span> ' . htmlspecialchars($timeline) . '
            </div>
            <div class="field">
                <span class="label">Message:</span><br>
                ' . nl2br(htmlspecialchars($message)) . '
            </div>
            <div class="footer">
                Sent from Snow Tech Agency website contact form
            </div>
        </div>
    </div>
</body>
</html>';

// Plain text version
$plainTextMessage = "
New Project Inquiry
------------------

Name: $name
Email: $email
Project Type: $projectType
Timeline: $timeline

Message:
$message

------------------
Sent from Snow Tech Agency website contact form
";

// Log attempt
file_put_contents($log_file, "$timestamp - Attempting to send email via SMTP\n", FILE_APPEND);

// Send email directly via SMTP
$result = sendMailSMTP($to, $subject, $htmlMessage, $plainTextMessage, $email, $name, $smtp_settings);

// Return result
if ($result['success']) {
    file_put_contents($log_file, "$timestamp - Email sent successfully\n", FILE_APPEND);
    echo json_encode(['success' => true, 'message' => 'Your message has been sent! We\'ll get back to you soon.']);
} else {
    file_put_contents($log_file, "$timestamp - Email sending failed: " . $result['error'] . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send email: ' . $result['error']]);
}

/**
 * Send email via direct SMTP connection
 */
function sendMailSMTP($to, $subject, $htmlMessage, $plainTextMessage, $replyToEmail, $replyToName, $smtp) {
    try {
        // Generate a boundary for the multipart message
        $boundary = md5(time());
        
        // Connect to SMTP server
        $smtp_conn = fsockopen(
            'ssl://' . $smtp['host'], 
            $smtp['port'], 
            $errno, 
            $errstr, 
            30
        );
        
        if (!$smtp_conn) {
            return ['success' => false, 'error' => "SMTP Connection failed: $errstr ($errno)"];
        }
        
        // Read server greeting
        fgets($smtp_conn, 515);
        
        // Identify ourselves
        fputs($smtp_conn, "EHLO " . $_SERVER['SERVER_NAME'] . "\r\n");
        fgets($smtp_conn, 515);
        
        // Request TLS encryption
        fputs($smtp_conn, "STARTTLS\r\n");
        fgets($smtp_conn, 515);
        
        // Enable encryption
        stream_socket_enable_crypto($smtp_conn, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
        
        // Re-identify after encryption
        fputs($smtp_conn, "EHLO " . $_SERVER['SERVER_NAME'] . "\r\n");
        fgets($smtp_conn, 515);
        
        // Authenticate
        fputs($smtp_conn, "AUTH LOGIN\r\n");
        fgets($smtp_conn, 515);
        fputs($smtp_conn, base64_encode($smtp['username']) . "\r\n");
        fgets($smtp_conn, 515);
        fputs($smtp_conn, base64_encode($smtp['password']) . "\r\n");
        $auth_response = fgets($smtp_conn, 515);
        
        if (strpos($auth_response, '235') === false) {
            return ['success' => false, 'error' => "SMTP Authentication failed: " . trim($auth_response)];
        }
        
        // Set sender
        fputs($smtp_conn, "MAIL FROM: <" . $smtp['username'] . ">\r\n");
        fgets($smtp_conn, 515);
        
        // Set recipient
        fputs($smtp_conn, "RCPT TO: <$to>\r\n");
        fgets($smtp_conn, 515);
        
        // Begin message data
        fputs($smtp_conn, "DATA\r\n");
        fgets($smtp_conn, 515);
        
        // Compose headers
        $headers = "From: " . $smtp['from_name'] . " <" . $smtp['from_email'] . ">\r\n";
        $headers .= "Reply-To: $replyToName <$replyToEmail>\r\n";
        $headers .= "To: <$to>\r\n";
        $headers .= "Subject: $subject\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";
        
        // Compose message with both text and HTML versions
        $message = $headers . "\r\n";
        $message .= "--$boundary\r\n";
        $message .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
        $message .= $plainTextMessage . "\r\n\r\n";
        $message .= "--$boundary\r\n";
        $message .= "Content-Type: text/html; charset=UTF-8\r\n";
        $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
        $message .= $htmlMessage . "\r\n\r\n";
        $message .= "--$boundary--\r\n.\r\n";
        
        // Send message data
        fputs($smtp_conn, $message);
        $data_response = fgets($smtp_conn, 515);
        
        if (strpos($data_response, '250') === false) {
            return ['success' => false, 'error' => "Data sending failed: " . trim($data_response)];
        }
        
        // Quit and close connection
        fputs($smtp_conn, "QUIT\r\n");
        fclose($smtp_conn);
        
        return ['success' => true];
        
    } catch (Exception $e) {
        return ['success' => false, 'error' => "Exception: " . $e->getMessage()];
    }
} 