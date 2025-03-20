<?php
$conn = new mysqli("localhost", "root", "", "image_uploads");

if (!isset($_FILES["image"]) || !isset($_POST["comment"])) {
    echo json_encode(["error" => "Missing required data"]);
    exit;
}

$target_dir = "uploads/";
if (!is_dir($target_dir)) mkdir($target_dir, 0777, true);

$image_name = time() . "_" . basename($_FILES["image"]["name"]);
$target_file = $target_dir . $image_name;

if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
    $comment = $conn->real_escape_string($_POST['comment']);
    $conn->query("INSERT INTO uploads (image, comment) VALUES ('$image_name', '$comment')");
    echo json_encode(["success" => "File uploaded successfully"]);
} else {
    echo json_encode(["error" => "File upload failed"]);
}

$conn->close();
?>
