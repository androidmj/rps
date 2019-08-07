<?php


namespace App\Model;

/**
 * Model used to manage homepage.
 */
class ContactModel extends BaseModel
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
        $this->load_head('contact');

        /*
         * todo: add info to database
         */
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