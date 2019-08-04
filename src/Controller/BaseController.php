<?php


namespace App\Controller;

use App\Includes\ClearCache;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;

class BaseController extends AbstractController
{
    public function __construct()
    {
        ClearCache::check_and_clear_cache();
    }
}