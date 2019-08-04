<?php
namespace App\Includes;
/*
 * Password Hashing With PBKDF2 (http://crackstation.net/hashing-security.htm).
 * Copyright (c) 2013, Taylor Hornby
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, 
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation 
 * and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE 
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN 
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
 * POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Class PasswordHash
 *
 * @package GAM
 */
class PasswordHash
{
  // These constants may be changed without breaking existing hashes.

  /**
   * @const string Hash algorithm
   */
  const PBKDF2_HASH_ALGORITHM = 'sha256';

  /**
   * @const int Set to at least 1000
   */
  const PBKDF2_ITERATIONS = 2000;

  /**
   * @const int
   */
  const PBKDF2_SALT_BYTE_SIZE = 24;

  /**
   * @const int
   */
  const PBKDF2_HASH_BYTE_SIZE = 48;

  /**
   * @const int
   */
  const HASH_SECTIONS = 4;

  /**
   * @const int
   */
  const HASH_ALGORITHM_INDEX = 0;

  /**
   * @const int
   */
  const HASH_ITERATION_INDEX = 1;

  /**
   * @const int
   */
  const HASH_SALT_INDEX = 2;

  /**
   * @const int
   */
  const HASH_PBKDF2_INDEX = 3;

  /**
   * @var string the salt for the password
   */
  private $salt;

  /**
   * @var the hashed password
   */
  private $hash;

  /**
   * @var string Any error message that arises
   */
  public $error_message = '';

  /**
   * Sets the salt and hash based on input
   *
   * @param string $password
   *
   * @return bool
   */
  public function create_hash($password)
  {

    if (!$this->check_password_format($password)) {
      return false;
    }

    // format: algorithm:iterations:salt:hash
    $this->salt = base64_encode(mcrypt_create_iv(self::PBKDF2_SALT_BYTE_SIZE, MCRYPT_DEV_URANDOM));
    $this->hash = self::PBKDF2_HASH_ALGORITHM . ":" . self::PBKDF2_ITERATIONS . ":" .  $this->salt . ":" .
                    base64_encode($this->pbkdf2(
                                self::PBKDF2_HASH_ALGORITHM,
                                $password,
                                $this->salt,
                                self::PBKDF2_ITERATIONS,
                                self::PBKDF2_HASH_BYTE_SIZE,
                                true
    ));

    return true;
  }

  /**
   * return the salt (should be set first)
   *
   * @return string
   */
  public function get_salt(){
    return $this->salt;
  }

  /**
   * return the hash (should be set first)
   *
   * @return string
   */
  public function get_hash(){
    return $this->hash;
  }

  /**
   * Validate the password
   *
   * @var string $password     The user entered password
   * @var string $correct_hash The correct hash for the user's password
   *
   * @return string
   */
  public function validate_password($password, $correct_hash)
  {
    $params = explode(":", $correct_hash);

    if (count($params) < self::HASH_SECTIONS) {
      return false;
    }

    $pbkdf2 = base64_decode($params[self::HASH_PBKDF2_INDEX]);

    return $this->slow_equals(
      $pbkdf2,
      $this->pbkdf2(
        $params[self::HASH_ALGORITHM_INDEX],
        $password,
        $params[self::HASH_SALT_INDEX],
        (int)$params[self::HASH_ITERATION_INDEX],
        strlen($pbkdf2),
        true
      )
    );
  }

  /**
   * Make sure password follows guidelines
   *
   * @var string $password     The user entered password
   *
   * @return bool
   */
  private function check_password_format($password) {
    $this->error_message = '';

    if (preg_match('/\s/',$password)) {
      $this->error_message = 'Password cannot contain spaces.';
      return false;
    }

    if (strlen($password) < 8) {
      $this->error_message = 'Password must be at least 8 characters.';
      return false;
    }

    if (strlen($password) > 100) {
      $this->error_message = 'Password must be less than 100 characters.';
      return false;
    }

    return true;
  }

  /**
   * Compares two strings $a and $b in length-constant time.
   *
   * @var string $a
   * @var string $b
   *
   * @return bool
   */
  private function slow_equals($a, $b)
  {
    $diff = strlen($a) ^ strlen($b);
    for ($i = 0; $i < strlen($a) && $i < strlen($b); $i++) {
      $diff |= ord($a[$i]) ^ ord($b[$i]);
    }
    return $diff === 0;
  }

  /*
   * PBKDF2 key derivation function as defined by RSA's PKCS #5: https://www.ietf.org/rfc/rfc2898.txt
   * $algorithm - The hash algorithm to use. Recommended: SHA256
   * $password - The password.
   * $salt - A salt that is unique to the password.
   * $count - Iteration count. Higher is better, but slower. Recommended: At least 1000.
   * $key_length - The length of the derived key in bytes.
   * $raw_output - If true, the key is returned in raw binary format. Hex encoded otherwise.
   * Returns: A $key_length-byte key derived from the password and salt.
   *
   * Test vectors can be found here: https://www.ietf.org/rfc/rfc6070.txt
   *
   * This implementation of PBKDF2 was originally created by https://defuse.ca
   * With improvements by http://www.variations-of-shadow.com
   *
   * @var string $algorithm
   * @var string $password
   * @var string $salt
   * @var int    $count
   * @var int    $key_length
   * @var bool   $raw_output
   *
   * @return string the hash
   */
  private function pbkdf2($algorithm, $password, $salt, $count, $key_length, $raw_output = false)
  {
    $algorithm = strtolower($algorithm);
    if (!in_array($algorithm, hash_algos(), true))
      trigger_error('PBKDF2 ERROR: Invalid hash algorithm.', E_USER_ERROR);
    if ($count <= 0 || $key_length <= 0)
      trigger_error('PBKDF2 ERROR: Invalid parameters.', E_USER_ERROR);

    if (function_exists("hash_pbkdf2")) {
      // The output length is in NIBBLES (4-bits) if $raw_output is false!
      if (!$raw_output) {
        $key_length = $key_length * 2;
      }
      return hash_pbkdf2($algorithm, $password, $salt, $count, $key_length, $raw_output);
    }

    $hash_length = strlen(hash($algorithm, "", true));
    $block_count = ceil($key_length / $hash_length);

    $output = "";
    for ($i = 1; $i <= $block_count; $i++) {
      // $i encoded as 4 bytes, big endian.
      $last = $salt . pack("N", $i);
      // first iteration
      $last = $xorsum = hash_hmac($algorithm, $last, $password, true);
      // perform the other $count - 1 iterations
      for ($j = 1; $j < $count; $j++) {
        $xorsum ^= ($last = hash_hmac($algorithm, $last, $password, true));
      }
      $output .= $xorsum;
    }

    if ($raw_output)
      return substr($output, 0, $key_length);
    else
      return bin2hex(substr($output, 0, $key_length));
  }
}

?>
