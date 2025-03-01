<?php
// Ensure we're sending JSON response
header('Content-Type: application/json');

// Prevent any output before our JSON response
ob_start();

// Include PHPMailer classes
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Update paths to point to correct location
require 'vendor/PHPMailer/src/Exception.php';
require 'vendor/PHPMailer/src/PHPMailer.php';
require 'vendor/PHPMailer/src/SMTP.php';

// Remove or comment out the composer autoload since we're not using it
// require 'vendor/autoload.php';

$config = require_once 'config/mail.php';

try {
    // Validate request method
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        throw new Exception('Method not allowed');
    }

    // Get form data
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $projectType = $_POST['project-type'] ?? '';
    $timeline = $_POST['timeline'] ?? '';
    $message = $_POST['message'] ?? '';

    // Validate required fields
    if (empty($name) || empty($email) || empty($projectType) || empty($timeline) || empty($message)) {
        throw new Exception('All fields are required');
    }

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }

    // Create a new PHPMailer instance
    $mail = new PHPMailer(true);

    // Server settings
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtp_username'];
    $mail->Password = $config['smtp_password'];
    $mail->SMTPSecure = $config['smtp_secure'];
    $mail->Port = $config['smtp_port'];

    // Recipients
    $mail->setFrom('hello@snowtech.agency', 'Snow Tech Website');
    $mail->addReplyTo($email, $name);
    $mail->addAddress('hello@snowtech.agency', 'Snow Tech');

    // Content
    $mail->isHTML(true);
    $mail->Subject = "New Project Inquiry from $name";
    
    // HTML email body
    $htmlContent = "
    <h2>New Project Inquiry</h2>
    <p><strong>Name:</strong> $name</p>
    <p><strong>Email:</strong> $email</p>
    <p><strong>Project Type:</strong> $projectType</p>
    <p><strong>Timeline:</strong> $timeline</p>
    <h3>Message:</h3>
    <p>" . nl2br(htmlspecialchars($message)) . "</p>
    ";
    
    $mail->Body = $htmlContent;
    $mail->AltBody = strip_tags(str_replace(['<br>', '</p>'], ["\n", "\n\n"], $htmlContent));

    // Send email
    if (!$mail->send()) {
        throw new Exception('Failed to send email: ' . $mail->ErrorInfo);
    }

    // Clear any output buffers
    while (ob_get_level()) {
        ob_end_clean();
    }

    // Send success response
    echo json_encode([
        'success' => true,
        'message' => 'Message sent successfully'
    ]);

} catch (Exception $e) {
    // Clear any output buffers
    while (ob_get_level()) {
        ob_end_clean();
    }

    // Send error response
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// Ensure we exit after sending response
exit; 