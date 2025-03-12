<?php
// Set content type to JSON for AJAX responses
header('Content-Type: application/json');

// Log submission for debugging
$log_file = 'form_submissions.log';
$timestamp = date('Y-m-d H:i:s');
file_put_contents($log_file, "$timestamp - Form submission received\n", FILE_APPEND);

// Get and sanitize form data
$name = isset($_POST['name']) ? filter_var(trim($_POST['name']), FILTER_SANITIZE_STRING) : '';
$email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_VALIDATE_EMAIL) : '';
$projectType = isset($_POST['project-type']) ? filter_var(trim($_POST['project-type']), FILTER_SANITIZE_STRING) : '';
$timeline = isset($_POST['timeline']) ? filter_var(trim($_POST['timeline']), FILTER_SANITIZE_STRING) : '';
$message = isset($_POST['message']) ? filter_var(trim($_POST['message']), FILTER_SANITIZE_STRING) : '';

// Validate inputs
$errors = [];
if (empty($name)) $errors[] = 'Name is required';
if (empty($email)) $errors[] = 'Valid email is required';
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
$to = 'hello@snowtech.agency';
$subject = "New Project Inquiry from $name";

// Set important headers for better deliverability
$headers = "From: Snow Tech Website <website@snowtech.agency>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Create HTML message
$htmlMessage = '
<!DOCTYPE html>
<html>
<head>
    <title>New Project Inquiry</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto;">
        <div style="background: #0066FF; color: white; padding: 20px; text-align: center;">
            <h1>New Project Inquiry</h1>
        </div>
        <div style="padding: 20px;">
            <p><strong>Name:</strong> ' . htmlspecialchars($name) . '</p>
            <p><strong>Email:</strong> ' . htmlspecialchars($email) . '</p>
            <p><strong>Project Type:</strong> ' . htmlspecialchars($projectType) . '</p>
            <p><strong>Timeline:</strong> ' . htmlspecialchars($timeline) . '</p>
            <p><strong>Message:</strong><br>' . nl2br(htmlspecialchars($message)) . '</p>
        </div>
        <div style="font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
            Sent from Snow Tech Agency website contact form
        </div>
    </div>
</body>
</html>';

// Log attempt
file_put_contents($log_file, "$timestamp - Attempting to send email via mail() function\n", FILE_APPEND);

// Send email using PHP's mail() function
$mailSent = mail($to, $subject, $htmlMessage, $headers);

// Return result
if ($mailSent) {
    file_put_contents($log_file, "$timestamp - Email sent successfully\n", FILE_APPEND);
    echo json_encode(['success' => true, 'message' => 'Your message has been sent! We\'ll get back to you soon.']);
} else {
    file_put_contents($log_file, "$timestamp - Email sending failed\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send email. Please try again or contact us directly at hello@snowtech.agency.']);
} 