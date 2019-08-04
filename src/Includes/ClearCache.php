<?php

namespace App\Includes;

/*
 * ClearCache Class
 */

use Symfony\Component\HttpFoundation\Request;

class ClearCache
{
    public static function check_and_clear_cache()
    {
        $request = Request::createFromGlobals();

        if(boolval($request->get('clearcache')) && $_SERVER['REMOTE_ADDR'] = Settings::ADMIN_IP_ADDRESS){
            exec("php /var/www/rps/bin/console cache:clear --env=prod");
        }
    }
}
?>