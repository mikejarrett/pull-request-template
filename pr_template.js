// @name      Pull Request Template
// @version    1.1
// @description  Populate Github pull request form
// @include /^(http|https)(\:\/\/)(.*?)(github)(.*?)(\/pull\/new\/)
// @include /^(http|https)(\:\/\/)(.*?)(github)(.*?)(\/compare\/)
// @copyright  2014+, Mike Jarrett
// ==/UserScript==
$(document).ready(function() {
    var els = getClass("form-actions", document.getElementById("preview_discussion_bucket"));
    if (els.length < 1) {
        els = getClass("composer-meta");
        els[0].appendChild(getIncludeTestsCheckbox(), els[0].firstChild)
        els[0].appendChild(getIncludeTestsLabel(), els[0].firstChild)
        els[0].appendChild(getAddButton(), els[0].firstChild)
    } else {
        els[0].insertBefore(getAddButton(), els[0].firstChild)
        els[0].insertBefore(getIncludeTestsLabel(), els[0].firstChild)
        els[0].insertBefore(getIncludeTestsCheckbox(), els[0].firstChild)
    }


    $('#append_pr_template').click(function() {
        appendPRTemplate();
    });

    function appendPRTemplate() {
        var tests_names = '';
        var migration_names = '';
        var requirements = '';
        var jira_id = '';

        if (document.getElementsByName("include_tests")[0].checked) {
            // See if there are any tests in the file list
            tests_names = '\n' + getTestsMigrationNames("js-selectable-text", document.getElementById("files"), "Test").join('\n') + '\n';

            // See if there are any migrations in the file list
            migration_names = '\n' + getTestsMigrationNames("js-selectable-text", document.getElementById("files"), "Migration").join('\n');

            // Look for a filename that contains "requirement".
            requirements = getTestsMigrationNames("js-selectable-text", document.getElementById("files"), "Requirement");
            if (typeof requirements !== 'undefined' && requirements.length > 0) {
                requirements = '**_True_**';
            }
        }

        var pr_template = [
            '**Story / Bug id**: ' + getIssueURL(),
            '**Project / App**: ' + getProjectName(),
            '**Reference person**: @' + $.trim(getClass("name")[0].text),
            '**Description**: ',
            '',
            '**Migrations**:' + migration_names,
            '',
            '**Rollback**: ',
            '',
            '**New imports / dependencies**: ' + requirements,
            '',
            '**Unit Tests**:' + tests_names,
            '**What tests do I need to run to validate this change**: ',
        ].join('\n');

        document.getElementsByName("pull_request[body]")[0].value += pr_template;
    }

    /*
     Check if the issue ID is in the title of the pull request form and append
     it after the story / bug label
    */
    function getIssueURL() {
        var tagId = "",
        projectUrl = "https://github.com/mikejarrett/pull-request-template/issues/";
        
        // Check to see if in the pull request title there is something that matches [CC-1234]
        var pr_title = document.getElementsByName('pull_request[title]');
        if (pr_title && pr_title.length > 0) {
            pr_title = pr_title[0].value.match(/\[(.*?)\]/);
            if (pr_title && pr_title.length > 1) {
                tagId = + pr_title[1];
            }
        }

        return tagId;
    }

    /*
     Attemp to retrieve the current repository's name and append it after the 
     project / app label
    */
    function getProjectName() {
        var project_name = '';
        var repo_name = getClass("pull-dest-repo");
        if (repo_name.length > 0) {
            project_name = repo_name[0].getElementsByTagName('a')[0].text;
        } else {
            repo_name = getClass("js-current-repository") || getClass("js-current-repository js-repo-home-link");
            if (repo_name.length > 0) {
                project_name = repo_name[0].text;
            }
        }

        return project_name;
    }

    /*
     Creates and adds the "Append Template" button near the "Create pull rquest"
     button
    */
    function getAddButton() {
        var add_tpl_button = document.createElement('a');
        add_tpl_button.setAttribute('href', '#');
        add_tpl_button.setAttribute('class', 'button');
        add_tpl_button.setAttribute('id', 'append_pr_template');

        var text_node = document.createTextNode('Append Template');
        add_tpl_button.appendChild(text_node);

        return add_tpl_button;
    }

    /*
     Creates the "Tests, Migrations, Requirments" checkbox above the
     "Append template" button
    */
    function getIncludeTestsCheckbox() {
        var include_tests_checkbox = document.createElement('input');
        include_tests_checkbox.setAttribute('type', 'checkbox');
        include_tests_checkbox.setAttribute('value', 'include_tests');
        include_tests_checkbox.setAttribute('name', 'include_tests');
        include_tests_checkbox.setAttribute('checked', 'true');

        return include_tests_checkbox;
    }

    /*
     Creates the "Tests, Migrations, Requirments" label
    */
    function getIncludeTestsLabel() {
        var include_tests_label = document.createElement('label');
        include_tests_label.setAttribute('for', 'id_include_tests');
        include_tests_label.setAttribute('name', 'include_tests');

        var text_node = document.createTextNode('Tests, Migrations, Requirements');
        include_tests_label.appendChild(text_node);

        return include_tests_label;
    }

    /*
     Retrieves a list of tests and migration files
    */
    function getTestsMigrationNames(clssName, rootNode, mode_) {
        var root = rootNode || document;
        var mode = mode_ || 'Test';
        var nodes = root.getElementsByClassName(clssName);
        var titles = [];

        for (var i = 0; i < nodes.length; i++) {
            if ((nodes[i].innerHTML.indexOf(mode) >= 0) || (nodes[i].innerHTML.indexOf(mode.toLowerCase()) >= 0)) {
                titles.push(' * `' + $.trim(nodes[i].innerHTML) + '`');
            }
        }

        return titles;
    }

    /*
     A helper function to find elements by class name
    */
    function getClass(clssName, rootNode) {
        var root = rootNode || document,
            clssEls = [],
            elems,
            clssReg = new RegExp("\\b" + clssName + "\\b");

        // use the built in getElementsByClassName if available
        if (document.getElementsByClassName) {
            return root.getElementsByClassName(clssName);
        }

        // otherwise loop through all(*) nodes and add matches to clssEls
        elems = root.getElementsByTagName('*');
        for (var i = 0, len = elems.length; i < len; i += 1) {
            if (clssReg.test(elems[i].className)) {
                clssEls.push(elems[i])
            }
            return clssEls;
        };
    }
});
