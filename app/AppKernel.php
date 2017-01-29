<?php

use Symfony\Component\HttpKernel\Kernel;
use Symfony\Component\Config\Loader\LoaderInterface;

class AppKernel extends Kernel
{
    public function registerBundles()
    {
        $bundles = array(
            new Symfony\Bundle\FrameworkBundle\FrameworkBundle(),
            new Symfony\Bundle\SecurityBundle\SecurityBundle(),
            new Symfony\Bundle\TwigBundle\TwigBundle(),
            new Symfony\Bundle\MonologBundle\MonologBundle(),
            new Symfony\Bundle\SwiftmailerBundle\SwiftmailerBundle(),
            new Symfony\Bundle\AsseticBundle\AsseticBundle(),
            new Sensio\Bundle\FrameworkExtraBundle\SensioFrameworkExtraBundle(),
            new Propel\PropelBundle\PropelBundle(),
            new ThirdEngine\PropelSOABundle\PropelSOABundle(),
            new Engine\AuthBundle\EngineAuthBundle(),
            new Engine\BillingBundle\EngineBillingBundle(),
            new Engine\DemographicBundle\EngineDemographicBundle(),
            new Engine\EngineBundle\EngineBundle(),
            new Engine\MediaBundle\EngineMediaBundle(),
            new Engine\ReportBundle\EngineReportBundle(),
            new Engine\SupportBundle\EngineSupportBundle(),
            new JMS\AopBundle\JMSAopBundle(),
            new JMS\DiExtraBundle\JMSDiExtraBundle($this),
            new JMS\SecurityExtraBundle\JMSSecurityExtraBundle(),
            new NewApp\NewAppBundle\NewAppBundle(),
        );

        if (in_array($this->getEnvironment(), array('dev', 'test'), true)) {
            $bundles[] = new Symfony\Bundle\DebugBundle\DebugBundle();
            $bundles[] = new Symfony\Bundle\WebProfilerBundle\WebProfilerBundle();
            $bundles[] = new Sensio\Bundle\DistributionBundle\SensioDistributionBundle();
            $bundles[] = new Sensio\Bundle\GeneratorBundle\SensioGeneratorBundle();
        }

        return $bundles;
    }

    public function registerContainerConfiguration(LoaderInterface $loader)
    {
        $localfile = $this->getRootDir() . '/config/config_' . $this->getEnvironment() . '_local.yml';
        if (file_exists($localfile) && is_readable($localfile))
        {
            $loader->load($localfile);
        }
        else
        {
          $loader->load($this->getRootDir().'/config/config_'.$this->getEnvironment().'.yml');
            $loader->load(__DIR__ . '/config/config_' . $this->getEnvironment() . '.yml');
        }
    }
}
