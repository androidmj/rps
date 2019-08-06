<?php

namespace App\Controller;

use App\Model\HomepageModel;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Controller used to manage rps contents in the public part of the site.
 *
 * @Route("/")
 *
 */
class HomepageController extends BaseController
{
    /**
     * @Route("", defaults={"page": "1", "_format"="html"}, methods={"GET"}, name="rps_index")
     * @Cache(smaxage="10")
     */
    public function index(): Response
    {
        $model = new HomepageModel();
        $model->load();

        return $this->render('default/homepage.html.twig', $model->get_render_data());
    }
}
