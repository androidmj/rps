<?php
namespace App\Includes;
/**
 * Class HeaderSettings
 *
 * @package GAM
 */
class HeaderSettings
{
  const HOME_ID         = '386716398291854733';
  const RPS_SERVICES    = '773775937670948757';
  const ORDER_ID        = '568311331132183930';
  const CONTACT_ID      = '652475320528800246';
  const LOGIN_ID        = '098780798789700798';
  const MY_ACCOUNT_ID   = '098734538789700444';
  const MAIN_URL        = 'https://www.xpsauto.com';

  private static $instance;

  public static function getInstance()
  {
    if ( is_null( self::$instance ) )
    {
      self::$instance = new self();
    }
    return self::$instance;
  }
}