<?php


namespace App\Model;

/**
 * Model used to manage homepage.
 */
class HomepageModel extends BaseModel
{
    /**
     * @var array the model data needed to render the view
     */
    protected $render_data = [];

    /**
     * Check for valid floor
     *
     * @return void
     */
    public function load(){
        $this->load_head('home');

        /*
         * todo: add info to database
         */
        $this->render_data['hero_data'][] = array('h1'=>'Secondary Equipment, Cobots, Assembly, Integration, and Robotics',
            'h2' => 'From seasoned workers who take pride<br>in producing the best product possible.',
            'link' => '/about',
            'link_text' => 'Get More with RPS',
            'link_title' => 'RPS cobots',
            'button_color' => 'btn-green',
            'background_image' => 'images/cobots-banner.png');

        $this->render_data['hero_data'][] = array('h1'=>'Robots with the Best Speed, Precision, and Productivity',
            'h2' => 'We build automation equipment using the best robots that are ideal for high-speed, precision applications such as assembly, pick and place, testing/inspection, and packing processes',
            'link' => '/about',
            'link_text' => 'Get More with RPS',
            'link_title' => 'RPS cobots',
            'button_color' => 'btn-yellow',
            'background_image' => 'images/fanuc-scara.jpg');

        $this->render_data['hero_data'][] = array('h1'=>'Industrial Robots for Manufacturing',
            'h2' => 'Versatility, reliability and world-renowned performance - we use robots that provide manufacturers worldwide with the productivity they need to improve performance and profitability',
            'link' => '/about',
            'link_text' => 'Get More with RPS',
            'link_title' => 'RPS cobots',
            'button_color' => 'btn-yellow',
            'background_image' => 'images/robots-for-manufacturing.jpg');
    }

    /**
     * return data for render
     *
     * @return array
     */
    public function get_render_data(){
        return $this->render_data;
    }
}