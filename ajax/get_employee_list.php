<?php
/**
 * Sample Test Data for the ajax
 *
 */
echo json_encode( array(
    'data'       => array(
        array(
            'first_name' => 'Test First Name',
            'last_name'  => 'Test Last Name',
            'mi'         => 'Test MI.',
            'id'         => 'Test id1',
            'edit_form'  => 'my-form'
        )
    ),
    'total_rows' => 11
) );