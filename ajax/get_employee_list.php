<?php
/**
 * Sample Test Data for the ajax
 *
 */
echo json_encode( array(
    'data'       => array(
        array(
            'first_name' => 'Test1 First Name',
            'last_name'  => 'Test1 Last Name',
            'mi'         => 'Test1 MI.',
            'id'         => 'Test1 id1',
            'edit_form'  => 'my-form'
        )
    ),
    'total_rows' => 11
) );