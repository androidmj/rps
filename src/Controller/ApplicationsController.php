<?php

namespace App\Controller;

use App\Entity\Comment;
use App\Entity\Post;
use App\Events\CommentCreatedEvent;
use App\Form\CommentType;
use App\Includes\ClearCache;
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
 * @Route("/applications")
 *
 */
class ApplicationsController extends BaseController
{
    /**
     * @Route("", defaults={"page": "1", "_format"="html"}, methods={"GET"}, name="rps_applications")
     * @Cache(smaxage="10")
     *
     */
    public function index(): Response
    {
        $main_head = new MainHead('applications');

        $render_data['page_type'] = 'applications';
        $render_data['page_title'] = $main_head->title;
        $render_data['page_description'] = $main_head->description;
        $render_data['page_og_image'] = $main_head->og_image;

        return $this->render('default/applications.html.twig', $render_data);
    }
}
