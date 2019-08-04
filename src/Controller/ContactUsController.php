<?php

namespace App\Controller;

use App\Includes\MainHead;
use Mailjet\Client;
use Mailjet\Resources;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

/**
 * Controller used to manage rps contents in the public part of the site.
 *
 * @Route("/contactus")
 *
 */
class ContactUsController extends BaseController
{
    /**
     * @Route("", defaults={"page": "1", "_format"="html"}, methods={"GET"}, name="rps_contact_us")
     * @Cache(smaxage="10")
     */
    public function index(): Response
    {
        $main_head = new MainHead('contactus');

        $render_data['page_type'] = 'contactus';
        $render_data['page_title'] = $main_head->title;
        $render_data['page_description'] = $main_head->description;
        $render_data['page_og_image'] = $main_head->og_image;

        return $this->render('default/contactus.html.twig', $render_data);
    }

    /**
     * @Route("/send_message", methods={"POST"}, name="rps_send_message")
     */
    public function send_message(Request $request): Response
    {
        if(!$email2 = filter_var($request->get('email2'), FILTER_VALIDATE_EMAIL)) {
            return $this->json(['message' => 'invalid email address']);
        }

        $comment = substr($request->get('comments'), 0, 2000);
        $name = substr($request->get('name'), 0, 300);

        $mj = new Client('05e5cde86a5208dee5b04e3256cba84d','0684352a932bad25f42595f0d2dc2548',true,['version' => 'v3.1']);
        $body = [
            'Messages' => [
                [
                    'From' => [
                        'Email' => 'noreply@rps-auto.com',
                        'Name' => 'RPS Automation'
                    ],
                    'To' => [
                        [
                            'Email' => 'sjarz@rpsgroup.us',
                            'Name' => 'Steve'
                        ]
                    ],
                    'Subject' => 'RPS message from ' . $name,
                    'TextPart' => $comment,
                    'HTMLPart' => $comment . '<br /><br />Contact info:<br />' . $name . '<br />' . $email2,
                    'CustomID' => 'ContactUsPage'
                ]
            ]
        ];

        $response = $mj->post(Resources::$Email, ['body' => $body]);

        if($response->success()) {
            $data = ['success' => true];
            $message = 'Thank you for your message! We\'ll get back to you as soon as we can.';
        } else {
            $data = ['success' => false];
            $message = 'Something went wrong, please try again.';
        }

        $results['message'] = $message;
        $results['data'] = $data;

        return $this->json($results);
    }
}
