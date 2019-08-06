<?php

namespace App\Controller;

use App\Entity\Comment;
use App\Entity\Post;
use App\Events\CommentCreatedEvent;
use App\Form\CommentType;
use App\Model\IndustriesModel;
use App\Repository\PostRepository;
use App\Repository\TagRepository;
use App\Includes\MainHead;
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
 * @Route("/industries")
 *
 */
class IndustriesController extends BaseController
{
    /**
     * @Route("", defaults={"page": "1", "_format"="html"}, methods={"GET"}, name="rps_industries")
     * @Cache(smaxage="10")
     *
     */
    public function index(): Response
    {
        $model = new IndustriesModel();
        $model->load();

        return $this->render('default/industries.html.twig', $model->get_render_data());
    }
}
