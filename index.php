<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title>Clone Filtering Test</title>
</head>
<body id="main_container">

<ul>
    <li class="employee-list" data-id="1">
        <div data-view-type="view">
            <p data-view-field="first_name">Eric</p>
            <p data-view-field="mi">S.</p>
            <p data-view-field="last_name">Nilo</p>
        </div>
        <div data-view-type="edit">
            <form>
                <input type="hidden" data-input-field="id" name="id" value="1">
                <input type="text" data-input-field="first_name" name="first_name" value="Eric" placeholder="First Name">
                <input type="text" data-input-field="mi" name="mi" value="S." placeholder="Middle Initial">
                <input type="text" data-input-field="last_name" name="last_name" value="Nilo" placeholder="Last Name">
            </form>
        </div>
    </li>

    <li class="employee-list" data-id="2">
        <div data-view-type="view">
            <p data-view-field="first_name">Emil</p>
            <p data-view-field="mi">S.</p>
            <p data-view-field="last_name">Nilo</p>
        </div>
        <div data-view-type="edit">
            <form>
                <input type="hidden" data-input-field="id" name="id" value="2">
                <input type="text" data-input-field="first_name" name="first_name" value="Emil" placeholder="First Name">
                <input type="text" data-input-field="mi" name="mi" value="S." placeholder="Middle Initial">
                <input type="text" data-input-field="last_name" name="last_name" value="Nilo" placeholder="Last Name">
            </form>
        </div>
    </li>
</ul>
<button id="load_more_btn">Load More</button>
<ul style="display: none;">
    <li data-template-for="#main_container"></li>
</ul>

</body>
<script src="js/jquery-1.11.1.js"></script>
<script src="js/cloneFiltering.js"></script>
<script>
    $(function () {
        $('#main_container').cloneFiltering({
            url      : 'ajax/get_something',
            container: '#container',
            template : '#template',
            limit    : 10,
            loadMore : 'button.load_more',
            search   : 'input.search',
            sort     : 'ul.sort'
        })
    });
</script>
</html>