const React = require('react');

class HomeSplash extends React.Component {
  render() {
    const {siteConfig, language = ''} = this.props;
    const {baseUrl, docsUrl, repoUrl} = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;

    const SplashContainer = props => (
      <div className="homeContainer">
          <div className="homeCustomWrapper">{props.children}</div>
      </div>
    );

    const ProjectTitle = () => (
      <h2 className="projectTitle">
        FilecoinJS
      </h2>
    );

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    );

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    return (
      <SplashContainer>
          <ProjectTitle />
          <PromoSection>
      <h2>Status</h2>
<div>
      This repository is in a standby state. It is not being actively maintained or kept in sync with the libraries it depends on. It may be archived in the near future. If you are interested in updating or maintaining this library, please open an issue or pull request for discussion.
The <a href="https://github.com/filecoin-shipyard/js-lotus-client">js-lotus-client</a> suite of libraries may be used to implement some of the features that were intended to be developed here and is under more active maintenance.
  </div>          
      <Button href={docUrl('introduction')}>Documentation</Button>
            <Button href={docUrl('api/filecoin.js')}>API Reference</Button>
            <Button href={repoUrl}>GitHub</Button>
          </PromoSection>
      </SplashContainer>
    );
  }
}

class Index extends React.Component {
  render() {
    const {config: siteConfig, language = ''} = this.props;

    return (
      <HomeSplash siteConfig={siteConfig} language={language} />
    );
  }
}

module.exports = Index;
