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

    /*
    * @var string type of page
    */
    public $page_type = '';

    /*
    * @var array data needed to render the head
    */
    public $render_data = [];

  function __construct($type = 'home')
  {
    $this->url = HeaderSettings::MAIN_URL;
    $this->page_type = $type;

    $home_description = 'By partnering with RPS Automation and Fanuc, you can be confident we will fulfill all of your automation needs. Since its inception, RPS Automation has brought quality Custom Machines and Integration to southeastern Michigan and beyond. We employ highly qualified specialists and seasoned workers who take pride in producing the best possible product. We provide a wide range of services that includes: secondary equipment, assembly, integration, and robotics. We operate all of our services in our 38,000 sq-ft of manufacturing space. One of our talented program managers oversees production every step of the way.';

    switch ($this->page_type) {
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
        $this->og_image = $this->url . '/images/robots-for-manufacturing.jpg';
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

  public function get_render_data(){
      $this->render_data['page_type'] = $this->page_type;
      $this->render_data['page_title'] = $this->title;
      $this->render_data['page_description'] = $this->description;
      $this->render_data['page_og_image'] = $this->og_image;

      return $this->render_data;
  }
}
?>