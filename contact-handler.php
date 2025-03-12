<?php
// Set content type to JSON for AJAX responses
header('Content-Type: application/json');

// Log submission for debugging
$log_file = 'form_submissions.log';
$timestamp = date('Y-m-d H:i:s');
file_put_contents($log_file, "$timestamp - Form submission received\n", FILE_APPEND);

// Generate a unique ID for this submission
$requestId = md5(uniqid(mt_rand(), true));
$lockFile = "submission_$requestId.lock";

// Check if this is a duplicate request (server might execute the script multiple times)
if (file_exists($lockFile)) {
    file_put_contents($log_file, "$timestamp - Duplicate request detected, aborting\n", FILE_APPEND);
    echo json_encode(['success' => true, 'message' => 'Your message has been sent! We\'ll get back to you soon.']);
    exit;
}

// Create lock file to prevent duplicate processing
touch($lockFile);

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
    unlink($lockFile); // Remove lock file
    exit;
}

// Prepare email content
$to = 'hello@snowtech.agency';
$subject = "New Project Inquiry from $name";

// Simple email approach with plain text
$headers = "From: website@snowtech.agency\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Create plain text email
$emailMessage = "New Project Inquiry\n";
$emailMessage .= "====================\n\n";
$emailMessage .= "Name: $name\n";
$emailMessage .= "Email: $email\n";
$emailMessage .= "Project Type: $projectType\n";
$emailMessage .= "Timeline: $timeline\n\n";
$emailMessage .= "Message:\n$message\n\n";
$emailMessage .= "====================\n";
$emailMessage .= "Sent from Snow Tech Agency website contact form";

// Log attempt
file_put_contents($log_file, "$timestamp - Attempting to send email via mail() function\n", FILE_APPEND);

// Send email using PHP's mail() function
$mailSent = mail($to, $subject, $emailMessage, $headers);

// Clean up lock file
unlink($lockFile);

// Return result
if ($mailSent) {
    file_put_contents($log_file, "$timestamp - Email sent successfully\n", FILE_APPEND);
    echo json_encode(['success' => true, 'message' => 'Your message has been sent! We\'ll get back to you soon.']);
} else {
    file_put_contents($log_file, "$timestamp - Email sending failed\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send email. Please try again or contact us directly at hello@snowtech.agency.']);
} 