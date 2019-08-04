<?php

namespace App\Includes;

/*
 * Header Class
 */

class MainHead
{
  /*
   * @var string title of the page
   */
  public $title = '';

  /* 
   * @var string image of the site to use on social posts
   */
    public $og_image = '';

  /*
   * @var string description of the page
   */
    public $description = '';

  /*
   * @var string url of the page
   */
    public $url;

  function __construct($type = 'home')
  {
    $this->url = HeaderSettings::MAIN_URL;

    $home_description = 'By partnering with RPS Automation and Fanuc, you can be confident we will fulfill all of your automation needs. Since its inception, RPS Automation has brought quality Custom Machines and Integration to southeastern Michigan and beyond. We employ highly qualified specialists and seasoned workers who take pride in producing the best possible product. We provide a wide range of services that includes: secondary equipment, assembly, integration, and robotics. We operate all of our services in our 38,000 sq-ft of manufacturing space. One of our talented program managers oversees production every step of the way.';

    switch ($type) {
      case 'home':
        $this->title = 'RPS Automation';
        $this->og_image = $this->url . '/images/cobots-banner.png';
        $this->description = $home_description;
        break;

      case 'equipment':
        $this->title = 'Equipment';
        $this->og_image = $this->url . '/images/px800.png';
        $this->description = $home_description;
        $this->url .= '/equipment';
        break;

      case 'applications':
        $this->title = 'Applications';
        $this->og_image = $this->url . '/images/cobots-banner.png';
        $this->description = 'RPS Automation specializes in Secondary Equipment, Assembly, Integration, and Robotics. By partnering with RPS Automation and Fanuc, you can be confident we will fulfill all of your automation needs. Since it’s inception, RPS Automation has brought quality Custom Machines and Integration to southeastern Michigan and beyond. We employ highly qualified specialists and seasoned workers who take pride in producing the best possible product. We provide a wide range of services that includes: secondary equipment, assembly, integration, and robotics.';
        $this->url .= '/applications';
        break;

      case 'contactus':
        $this->title = 'Contact Us';
        $this->og_image = $this->url . '/images/cobots-banner.png';
        $this->description = $home_description;
        $this->url .= '/contactus';
        break;

      case 'industries':
        $this->title = 'Industries';
        $this->og_image = $this->url . '/images/robots-for-maufacturing.jpg';
        $this->description = 'RPS Automation specializes in the design and manufacturing of Automated and Secondary Equipment for world-class manufacturers across many industries. Our services include Secondary Equipment design, Assembly, Integration, and Robotics. Additionally, we can support almost any industry. Though not an exhaustive list, we support Automotive and Transportation, Aerospace, Appliance, Construction, Farm and Construction, Furniture, Large Truck, Medical, Military and US Department of Defense, Power Tool, Recreational Vehicles, Renewable Energy, and Sports.';
        $this->url .= '/industries';
        break;

      case 'about':
        $this->title = 'About RPS';
        $this->og_image = $this->url . '/images/px800.png';
        $this->description = $home_description;
        $this->url .= '/about';
        break;

      default:
        $this->title = 'RPS Automation';
        $this->og_image = $this->url . '/images/cobots-banner.png';
        $this->description = $home_description;
        break;
    }
  }

  public function print_head()
  {
    ?>
    <!DOCTYPE html>
    <html lang="en">
  <head>
    <meta name="norton-safeweb-site-verification"
          content="1ov-s6ffy9xtthqbzww18q65jmew2r4my7tpr9tmg5lbaj3amda4hkwh5mojyn7n77zflgz572s-v1py-hwnnxwx4cucusl2nyhtwx9bhjd3ajc2bok8vx-bdl01tfur"/>
    <title><?php echo $this->title; ?> | RPS</title>
    <meta name="description" content="<?php echo $this->description; ?>">
    <meta content="IE=edge" http-equiv="X-UA-Compatible">
    <meta charset="utf-8">
    <meta content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no"
          name="viewport">
    <meta name="fragment" content="!">
    <meta name="msapplication-TileColor" content="#da532c">
    <meta name="msapplication-TileImage" content="/mstile-144x144.png">
    <meta name="theme-color" content="#ffffff">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">

    <!--og is so facebook and other sites know what to put in a post-->
    <meta property="og:site_name" content="OneGoodMeal">
    <meta property="og:title" content="<?php echo $this->title; ?>">
    <meta property="og:description" content="<?php echo $this->description; ?>">
    <meta property="og:image" content="<?php echo $this->og_image; ?>"/>
    <meta property="og:url" content="<?php echo $this->url; ?>">
    <link href="<?php echo $this->url; ?>" rel="canonical">


    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

    <link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">
    <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
    <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32">
    <link rel="icon" type="image/png" href="/android-chrome-192x192.png" sizes="192x192">
    <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96">
    <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16">
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">

    <link rel="stylesheet" media="screen" href="/public/css/flow.1.2.min.css">
    <link rel="icon" href="/public/css/cropped-icon-32x32.png" sizes="32x32">
    <link rel="icon" href="/public/css/cropped-icon-192x192.png" sizes="192x192">
    <link rel="apple-touch-icon-precomposed" href="/public/css/cropped-icon-180x180.png">
    <meta name="msapplication-TileImage" content="/public/css/cropped-icon-270x270.png">
    <link rel="preconnect" href="https://www.google-analytics.com">
    <script type="text/javascript" src="/public/js/jquery-3.4.1.min.js"></script>
    <script type="text/javascript" src="/public/js/jquery.flexslider.min.js"></script>
    <script type="text/javascript" src="/public/js/rpsMain1.3.min.js"></script>
  </head>
    <?php
  }
}
?>