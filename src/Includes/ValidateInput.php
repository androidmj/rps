<?php
namespace App\Includes;

/**
 * Class Login
 *
 * @package GAM
 */
class ValidateInput{
  /**
   * @var string error message to display
   */
  public $error_message = '';

  /**
   * @var string|bool user id
   */
  public $user_id = false;

  /**
   * @var bool is the user logged in?
   */
  public $is_logged_in = false;

  /**
   * @var \App\Includes\CleanFunctions
   */
  private $clean_functions;

  function __construct(){
    $this->clean_functions = new CleanFunctions();
  }

  /**
   * Check for valid email
   *
   * $param string $email
   *
   * @return bool
   */
  public function validate_email($email) {
    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
      $db = new DbConnect();
      $result = $db->db_query("SELECT 1
                              FROM goodmeal.dbo.Customer c
                              WHERE email = '" . $email . "'
                              AND inactive = 0");

      if ($r = $result->fetch()) {
        $this->error_message = 'Account already exists with ' . $email . '.';
        return false;
      }

      return true;
    }

    $this->error_message = 'Invalid email address.';
    return false;
  }

  /**
   * Check for valid section
   *
   * $param string $section
   *
   * @return bool
   */
  public function validate_section($section) {
    # Section must be 1-7, otherwise not wayfair section
    if (preg_match('/^[1-7]{1}+$/', $section)) {
      return true;
    }

    $this->error_message = 'Invalid section.';
    return false;
  }

  /**
   * Check for valid floor
   *
   * $param string $floor
   *
   * @return bool
   */
  public function validate_floor($floor) {
    # Floor must be 1-7, otherwise not wayfair floor
    if (preg_match('/^[1-7]{1}+$/', $floor)) {
      return true;
    }

    $this->error_message = 'Invalid section.';
    return false;
  }

  public function validate_cell_phone($cell_phone_number) {
    # Floor must be 1-7, otherwise not wayfair floor
    if (preg_match('/(^[2-9]{1}[0-9]{2}[2-9]{1}[0-9]{6})$/', $cell_phone_number)) {
      $db = new DbConnect();
      $result =  $db->db_query("SELECT 1
                              FROM goodmeal.dbo.Customer c
                              WHERE cellPhone = '" . $cell_phone_number . "'
                              AND inactive = 0");

      if ($r = $result->fetch()) {
        $this->error_message = 'Account already exists with this cell phone number.';
        return false;
      }
      return true;
    }

    $this->error_message = 'Invalid cell phone number.';
    return false;
  }

  /**
   * Check for valid floor
   *
   * $param int $company_id
   *
   * @return bool
   */
  public function validate_company($company_id) {
    # company id needs to be greater than 0
    if($company_id > 0){
      return true;
    }

    $this->error_message = 'Invalid company.';
    return false;
  }
}
?>