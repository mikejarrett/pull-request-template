// ==UserScript==
// @name      Pull Request Template
// @version    1.1
// @description  Populate Github pull request form
// @include /^(http|https)(\:\/\/)(.*?)(github)(.*?)(\/pull\/new\/)
// @include /^(http|https)(\:\/\/)(.*?)(github)(.*?)(\/compare\/)
// @copyright  2014+, Mike Jarrett
// ==/UserScript==

$(document).ready(function() {
    var els = getClass("form-actions", document.getElementById("preview_discussion_bucket"));
    if (els.length < 1)
    {
        els = getClass("composer-meta");
        els[0].appendChild(getIncludeTestsCheckbox(), els[0].firstChild)
        els[0].appendChild(getIncludeTestsLabel(), els[0].firstChild)
        els[0].appendChild(getAddButton(), els[0].firstChild)
    }
    else
    {
        els[0].insertBefore(getAddButton(), els[0].firstChild)
        els[0].insertBefore(getIncludeTestsLabel(), els[0].firstChild)
        els[0].insertBefore(getIncludeTestsCheckbox(), els[0].firstChild)
    }


    $('#append_pr_template').click(function () {
        appendPRTemplate();
    });

    function nop() { return false }

    function appendPRTemplate () {
        var testsNames = '';
            migrationNames = '',
            requirements = '',
            scriptNames = '';

        if (document.getElementsByName("include_tests")[0].checked) {
            // See if there are any tests in the file list
            testsNames = buildTestsMigrations("Test");

            // See if there are any migrations in the file list
            migrationNames = buildTestsMigrations("Migration");

            scriptNames = buildScriptsToRun();

            // Look for a filename that contains "requirement".
            requirements = getNames("js-selectable-text", document.getElementById("files"), "Requirement");
            if (typeof requirements !== 'undefined' && requirements.length > 0) {
                requirements = '**_True_**';
                getRequirementUpdates();
            }
        }

        var pr_template = [
            '**Story / Bug id**: ' + getJiraURL(),
            '**Project / App**: ' + getProjectName(),
            '**Reference person**: @' + $.trim(getClass("name")[0].text),
            '**Description**:\n',
            '',
            '**Migrations**:\n' + migrationNames.join('\n'),
            '',
            '**Rollback**:\n',
            '',
            '**New imports / dependencies**: ' + requirements,
            '',
            '**Unit Tests**:\n' + testsNames.join('\n'),
            '',
            '**What tests do I need to run to validate this change**:\n',
            '',
            '## Scripts to be run:',
            scriptNames.join('\n'),
            '',
            '## New or Changed JS and / or HTML Files:',
            getChangedStaticFiles().join('\n'),
        ].join('\n');

        document.getElementsByName("pull_request[body]")[0].value += pr_template;
    }

    function getJiraURL () {
        var tagId = '';
        // Check to see if in the pull request title there is something that matches [CC-1234]
        var pr_title = document.getElementsByName('pull_request[title]');
        if (pr_title && pr_title.length > 0) {
            pr_title = pr_title[0].value.match(/\[(.*?)\]/);
            if (pr_title && pr_title.length > 1) {
                tagId = "https://hogarthww.atlassian.net/browse/" + pr_title[1];
            }
        }

        return tagId;
    }

    function getProjectName () {
        var repoName = '';

        repoName = getClass("js-current-repository");
        if (repoName && repoName.length > 0) {
            return repoName[0].text;
        }

        repoName = getClass("pull-dest-repo");
        if (repoName && repoName.length > 0) {
            return repoName[0].getElementsByTagName('a')[0].text;
        }

        repoName = getClass("js-current-repository js-repo-home-link");
        if (repoName && repoName.length > 0) {
            return repoName[0].text;
        }
    }

    function getAddButton () {
        //<a href="#" id="append_pr_template" class="button">Append Template</a>
        var add_tpl_button = document.createElement('a');
        add_tpl_button.setAttribute('href', '#');
        add_tpl_button.setAttribute('class', 'button');
        add_tpl_button.setAttribute('id', 'append_pr_template');

        var text_node = document.createTextNode('Append Template');
        add_tpl_button.appendChild(text_node);

        return add_tpl_button;
    }

    function getIncludeTestsCheckbox () {
        //<input type="checkbox" value="include_tests" name="include_tests" checked="true">
        var include_tests_checkbox = document.createElement('input');
        include_tests_checkbox.setAttribute('type', 'checkbox');
        include_tests_checkbox.setAttribute('value', 'include_tests');
        include_tests_checkbox.setAttribute('name', 'include_tests');
        include_tests_checkbox.setAttribute('checked', 'true');

        return include_tests_checkbox;
    }

    function getIncludeTestsLabel () {
        //<label for="id_include_tests">Include Tests</label>
        var include_tests_label = document.createElement('label');
        include_tests_label.setAttribute('for', 'id_include_tests');
        include_tests_label.setAttribute('name', 'include_tests');

        var text_node = document.createTextNode('Tests, Migrations, Requirements');
        include_tests_label.appendChild(text_node);

        return include_tests_label;
    }

    function getNames (clssName, rootNode, mode_) {
        var root = rootNode || document;
        var mode = mode_ || 'Test';
        var nodes = root.getElementsByClassName(clssName);
        var titles = [];

        for (var i=0;i<nodes.length;i++)
        {
            if ((nodes[i].innerHTML.indexOf(mode) >= 0) || (nodes[i].innerHTML.indexOf(mode.toLowerCase()) >= 0))
            {
                titles.push($.trim(nodes[i].innerHTML));
            }
        }

        return titles;
    }

    function buildTestsMigrations (mode_) {
        var titles = [],
            titlesNames = [],
            mode = mode_ || 'Test';

        titlesNames = getNames("js-selectable-text", document.getElementById("files"), mode);
        for (var i=0; i<titlesNames.length; i++) {
                titles.push('* `' + titlesNames[i] + '`')
        }
        return titles;
    }

    function buildScriptsToRun () {
        var scripts = [],
            scriptNames = [];

        scriptNames = getNames("js-selectable-text", document.getElementById("files"), "Scripts");
        for (var i=0; i<scriptNames.length; i++) {
            try {
                scripts.push('* `django-admin.py run_script ' + scriptNames[i].split('scripts/')[1].split('.py')[0] + '`')
            }
            catch(err) {
                nop()
            }
        }
        return scripts;
    }

    function getChangedStaticFiles () {
        var fileTitles = [],
            htmlFiles = [],
            javaScriptFiles = [];

        htmlFiles = getNames("js-selectable-text", document.getElementById("files"), "Templates");
        for (var i=0; i<htmlFiles.length; i++) {
            fileTitles.push('* `' + htmlFiles[i] + '`')
        }

        javaScriptFiles = getNames("js-selectable-text", document.getElementById("files"), "Static");
        for (var i=0; i<javaScriptFiles.length; i++) {
            fileTitles.push('* `' + javaScriptFiles[i] + '`')
        }

        return fileTitles;
    }

    function getRequirementUpdates() { return false;}

    function getClass (clssName, rootNode) {
        var root = rootNode || document,
        clssEls = [],
        elems,
        clssReg = new RegExp("\\b"+clssName+"\\b");

        // use the built in getElementsByClassName if available
        if (document.getElementsByClassName){
            return root.getElementsByClassName(clssName);
        }

        // otherwise loop through all(*) nodes and add matches to clssEls
        elems = root.getElementsByTagName('*');
        for (var i = 0, len = elems.length; i < len; i+=1)
        {
            if (clssReg.test(elems[i].className))
            {
                clssEls.push(elems[i])
            }
            return clssEls;
        };
    }
});
