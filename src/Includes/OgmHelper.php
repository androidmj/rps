<?php
namespace App\Includes;

/**
 * Class OgmHelper
 *
 * @package GAM
 */
class OgmHelper{
  /**
   * @var string options html code
   */
  private $company_options_for_selector = '';

  public static function isMobile() {
    return preg_match("/(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i", $_SERVER["HTTP_USER_AGENT"]);
  }

  /**
   * Get string for the options for the selector used throughout the site
   *
   * @return string
   */
  public function get_company_options_for_selector_string(){
    if($this->company_options_for_selector) {
      return $this->company_options_for_selector;
    }

    $db = new DbConnect();

    $query = 'SELECT ccId, companyName FROM goodmeal.dbo.customerCompanies order by companyName';
    $result = $db->db_query($query);

    $company_options_for_selector = '<option value="0" selected>Select your company:</option>';

    while($r = $result->fetch()){
      $company_options_for_selector .= '<option value="' . $r['ccId'] . '">' . $r['companyName'] . '</option>';
    }

    $this->company_options_for_selector = $company_options_for_selector;

    return $this->company_options_for_selector;
  }

  public static function redirect_if_not_ajax(){
    if(empty($_SERVER['HTTP_X_REQUESTED_WITH']) || strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) != 'xmlhttprequest') {
      header("Location: " . \App\Includes\HeaderSettings::MAIN_URL);
      die();
    }
  }
}
?>