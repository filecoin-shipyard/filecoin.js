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
          <div>
            This repository is currently being updated and will be further updated to support the coming Filecoin VM. Learn more at fvm.filecoin.io
          </div>
          <div className="pluginRowBlock">
            <Button href={docUrl('introduction')}>Documentation</Button>
            <Button href={docUrl('api/filecoin.js')}>API Reference</Button>
            <Button href={repoUrl}>GitHub</Button>
          </div>
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
