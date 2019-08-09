<?php


namespace App\Model;

/**
 * Model used to manage homepage.
 */
class AboutModel extends BaseModel
{
    /**
     * @var array the model data needed to render the view
     */
    protected $render_data = [];

    /**
     * Model load function
     *
     * @return void
     */
    public function load(){
        $this->load_head('about');
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