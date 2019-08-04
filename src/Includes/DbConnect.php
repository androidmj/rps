<?php
namespace App\Includes;

/**
 * Class CreateUser
 *
 * @package GAM
 */
class DbConnect
{
  public $mssql_conn;
  public $db;

  function __construct() {

    try {
      $this->db = new \PDO('dblib:host=' . Settings::dbHost . ';dbname=goodmeal', Settings::dbUser, Settings::dbPass);
    } catch (\PDOException $e) {
      die ("Failed to get DB handle: " . $e->getMessage() . "\n");
    }
  }

  public function db_query($query){
    $stmt = $this->db->prepare($query);
    $stmt->execute();

    return $stmt;
  }
}



?>