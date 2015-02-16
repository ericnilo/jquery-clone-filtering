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
        ),
        array(
            'first_name' => 'Test2 First Name',
            'last_name'  => 'Test2 Last Name',
            'mi'         => 'Test2 MI.',
            'id'         => 'Test2 id1',
            'edit_form'  => 'my-form'
        ),
        array(
            'first_name' => 'Test3 First Name',
            'last_name'  => 'Test3 Last Name',
            'mi'         => 'Test3 MI.',
            'id'         => 'Test3 id1',
            'edit_form'  => 'my-form'
        ),
    ),
    'total_rows' => 11
) );