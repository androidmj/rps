<?php
namespace App\Includes;

/*
* For strings we only allow alphanumeric values.  For numbers, we only allow numbers
* Since we are not storing user comments, we can prevent
* SQL injections by replacing dangerous characters.
*/
class CleanFunctions
{
  public function mssql_clean_string($string)
  {
    $cleaned = preg_replace('/[^A-Za-z0-9]/', null, $string);
    return $cleaned;
  }

  public function mssql_clean_bit($bit)
  {
    $cleaned = preg_replace('/[^0-1]/', null, $bit);
    return $cleaned;
  }

  public function mssql_clean_num($num)
  {
    $cleaned = preg_replace('/[^0-9]/', null, $num);
    return $cleaned;
  }

  public function mssql_clean_alphanumhyphen($string)
  {
    $cleaned = preg_replace('/[^A-Za-z0-9 -_]/', null, $string);
    return $cleaned;
  }

  public function mssql_clean_numdecimal($string)
  {
    $cleaned = preg_replace('/[^0-9.]/', null, $string);
    return $cleaned;
  }

  public function mssql_clean_operator($string)
  {
    $cleaned = preg_replace('/[^LIKEIN<>=]/', null, $string);
    return $cleaned;
  }

  public function mssql_clean_alphanumcommaspace($string)
  {
    $cleaned = "'" . preg_replace('/[^A-Za-z0-9,-._ ]/', null, $string) . "'";
    return $cleaned;
  }

  public function mssql_clean_alphanumcommaspaceparen($string)
  {
    $cleaned = preg_replace('/[^A-Za-z0-9,-._ ()]/', null, $string);
    return $cleaned;
  }

  public function date_clean_end($date)
  {
    if ($date == '') {
      $date_clean = strtotime(date("m/d/Y") . ' 23:59:59') . '000';
    } else {
      $date_clean = strtotime($date . ' 23:59:59') . '000';
    }
    return $date_clean;
  }

  public function date_clean_start($date)
  {
    if ($date == '') {
      $date_clean = strtotime(date("m/d/Y") . ' 00:00:00') . '000';
    } else {
      $date_clean = strtotime($date . ' 00:00:00') . '000';
    }
    return $date_clean;
  }

  public function date_clean_time($date, $time)
  {
    $date_clean = strtotime($date . ' ' . $time) . '000';
    return $date_clean;
  }

  public function mssql_escape_string($string)
  {
    $cleaned = str_replace("'", "''", $string);
    return $cleaned;
  }

  public function get_CurrentUnixTimeStamp()
  {
    return substr(microtime(true) * 10000, 0, -1);
  }
}

?>