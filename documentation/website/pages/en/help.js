/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;
const MarkdownBlock = CompLibrary.MarkdownBlock;

function Help(props) {
  const {config: siteConfig, language = ''} = props;
  const {baseUrl, docsUrl, repoUrl} = siteConfig;
  const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
  const langPart = `${language ? `${language}/` : ''}`;
  const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;

  const supportLinks = [
    {
      content: `Find what you're looking for in our detailed documentation and guides. <br/><br/>
        - Learn how to [get started](/docs/en/getting-started.html) with filecoin.js. <br/>
        - Look at the full [API Reference](/docs/en/api.html).`,
      title: 'Browse the docs',
    },
    {
      content: `Ask questions and find answers from other filecoin.js users. <br><br>
        - Many members of the community use Slack. Join [our community]("https://filecoinproject.slack.com/")<br>
        - Join the [discussion forum]("https://discuss.filecoin.io/")`,
      title: 'Join the community',
    },
    {
      content: `View filecoin.js on [GitHub](${repoUrl}).`,
      title: 'GitHub',
    },
  ];

  return (
    <div className="docMainWrapper wrapper">
      <Container className="mainContainer documentContainer postContainer">
        <div className="post">
          <header className="postHeader">
            <h1>Need help?</h1>
          </header>
          <GridBlock contents={supportLinks} layout="threeColumn" />
        </div>
      </Container>
    </div>
  );
}

module.exports = Help;
