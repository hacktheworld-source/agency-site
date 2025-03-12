<?php
// Set content type to JSON for AJAX responses
header('Content-Type: application/json');

// Log submission for debugging
$log_file = 'form_submissions.log';
$log_entry = date('Y-m-d H:i:s') . " - New form submission\n";
file_put_contents($log_file, $log_entry, FILE_APPEND);

try {
    // Validate request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method. Only POST requests are accepted.');
    }

    // Get and sanitize form data
    $name = isset($_POST['name']) ? filter_var(trim($_POST['name']), FILTER_SANITIZE_STRING) : '';
    $email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_VALIDATE_EMAIL) : '';
    $projectType = isset($_POST['project-type']) ? filter_var(trim($_POST['project-type']), FILTER_SANITIZE_STRING) : '';
    $timeline = isset($_POST['timeline']) ? filter_var(trim($_POST['timeline']), FILTER_SANITIZE_STRING) : '';
    $message = isset($_POST['message']) ? filter_var(trim($_POST['message']), FILTER_SANITIZE_STRING) : '';

    // Validate required fields
    if (empty($name)) {
        throw new Exception('Please provide your name.');
    }
    
    if (empty($email)) {
        throw new Exception('Please provide a valid email address.');
    }
    
    if (empty($projectType)) {
        throw new Exception('Please select a project type.');
    }
    
    if (empty($timeline)) {
        throw new Exception('Please select a timeline.');
    }
    
    if (empty($message)) {
        throw new Exception('Please provide project details.');
    }

    // Log the validated data
    $submission_data = [
        'name' => $name,
        'email' => $email, 
        'project_type' => $projectType,
        'timeline' => $timeline,
        'message_preview' => substr($message, 0, 100) . (strlen($message) > 100 ? '...' : '')
    ];
    file_put_contents($log_file, json_encode($submission_data) . "\n", FILE_APPEND);

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
    $htmlMessage = "
    <html>
    <head>
      <title>New Project Inquiry</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        h2 { color: #0066FF; }
        .details { background: #f9f9f9; padding: 15px; border-left: 4px solid #0066FF; }
      </style>
    </head>
    <body>
      <h2>New Project Inquiry from Website</h2>
      <div class='details'>
        <p><strong>Name:</strong> $name</p>
        <p><strong>Email:</strong> $email</p>
        <p><strong>Project Type:</strong> $projectType</p>
        <p><strong>Timeline:</strong> $timeline</p>
        <h3>Project Details:</h3>
        <p>" . nl2br($message) . "</p>
      </div>
    </body>
    </html>
    ";

    // Send email and check result
    $mailSent = mail($to, $subject, $htmlMessage, $headers);

    // Log the result
    file_put_contents($log_file, "Mail sent result: " . ($mailSent ? "Success" : "Failed") . "\n", FILE_APPEND);

    // Return response based on mail sending result
    if ($mailSent) {
        echo json_encode([
            'success' => true, 
            'message' => 'Thank you for your message! We\'ll be in touch within 1 hour.'
        ]);
    } else {
        throw new Exception('Failed to send your message. Please try again or contact us directly at hello@snowtech.agency.');
    }

} catch (Exception $e) {
    // Log the error
    file_put_contents($log_file, "Error: " . $e->getMessage() . "\n", FILE_APPEND);
    
    // Return error response
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 