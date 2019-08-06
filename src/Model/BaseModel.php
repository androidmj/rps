<?php


namespace App\Model;

use App\Includes\MainHead;

/**
 * Model used to manage homepage.
 */
class BaseModel
{
    /**
     * @var array the model data needed to render the view
     */
    protected $render_data = [];

    /**
     * Check for valid floor
     *
     * @param string page type
     *
     * @return void
     */
    public function load_head(string $page_type){
        $main_head = new MainHead($page_type);

        $this->render_data = $main_head->get_render_data();
    }
}