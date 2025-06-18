async function md2html(README) {
    const filename_regex = /\/([^\/]+)\.md$/;
    const base_branch_regex = /(.+)\/refs\/heads\/([^\/]+)\//;
    const current_dir = README.replace(`${README.match(filename_regex)[1]}.md`, "");
    const base_dir = README.match(base_branch_regex)[1] + '/refs/heads/' + README.match(base_branch_regex[2]);

    function import_readme(url) {
        return fetch(url).then(res => res.text()).then(data => { return data }).catch(err => console.error('Fetch error:', err));
    }

    const content = await import_readme(README);
    let html = marked.parse(content);

    const url_regex = [
        /(?:src|href|poster)="([^"]+)"/g,
        /(?:src|href|poster)='([^']+)'/g
    ];

    let relative_urls = [];

    for (const regex of url_regex) {
        for (const match of html.matchAll(regex)) {
            if (!match[1].startsWith('http')) relative_urls.push(match[1]);
        }
    }

    for (const url of relative_urls) {
        if (url.startsWith('/')) {
            html = html.replace(url, `${base_dir}${url}`);
        } else {
            html = html.replace(url, `${current_dir}${url}`);
        }
    }

    return html;
}