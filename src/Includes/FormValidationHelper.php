<?php
namespace App\Includes;

/**
 * Class OgmHelper
 *
 * @package GAM
 */
class FormValidationHelper{
  /**
   * @var string options html code
   */
  private $company_options_for_selector = '';

  public static function isMobile() {
    return preg_match("/(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i", $_SERVER["HTTP_USER_AGENT"]);
  }
}
?>