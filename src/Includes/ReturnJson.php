<?php
namespace App\Includes;

/**
 * Class ReturnJson
 *
 * @package GAM
 */
class ReturnJson
{
  /**
   * Return json arry and die
   *
   * $param string $message
   * $param array $data
   *
   * @return void
   */
  public static function return_json_message_and_die($message, $data = null){
    $return['message'] = $message;

    if (!is_null($data)) {
      $return['data'] = $data;
    }

    echo json_encode($return);
    die;
  }
}
?>