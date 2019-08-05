<?php

namespace App\Controller;

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
        $main_head = new MainHead('home');

        $render_data['page_type'] = 'home';
        $render_data['page_title'] = $main_head->title;
        $render_data['page_description'] = $main_head->description;
        $render_data['page_og_image'] = $main_head->og_image;

        $render_data['hero_data'][] = array('h1'=>'Secondary Equipment, Cobots, Assembly, Integration, and Robotics',
            'h2' => 'From seasoned workers who take pride<br>in producing the best product possible.',
            'link' => '/about',
            'link_text' => 'Get More with RPS',
            'link_title' => 'RPS cobots',
            'button_color' => 'btn-green',
            'background_image' => 'images/cobots-banner.png');

        $render_data['hero_data'][] = array('h1'=>'Robots with the Best Speed, Precision, and Productivity',
            'h2' => 'We build automation equipment using the best robots that are ideal for high-speed, precision applications such as assembly, pick and place, testing/inspection, and packing processes',
            'link' => '/about',
            'link_text' => 'Get More with RPS',
            'link_title' => 'RPS cobots',
            'button_color' => 'btn-yellow',
            'background_image' => 'images/fanuc-scara.jpg');

        $render_data['hero_data'][] = array('h1'=>'Industrial Robots for Manufacturing',
            'h2' => 'Versatility, reliability and world-renowned performance - we use robots that provide manufacturers worldwide with the productivity they need to improve performance and profitability',
            'link' => '/about',
            'link_text' => 'Get More with RPS',
            'link_title' => 'RPS cobots',
            'button_color' => 'btn-yellow',
            'background_image' => 'images/robots-for-maufacturing.jpg');

        return $this->render('default/homepage.html.twig', $render_data);
    }
}
