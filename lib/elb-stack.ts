import { Construct, Stack, StackProps, CfnOutput } from "@aws-cdk/core";
import { Cluster, FargateService } from "@aws-cdk/aws-ecs";
import {
  ApplicationLoadBalancer,
  ApplicationProtocol,
} from "@aws-cdk/aws-elasticloadbalancingv2";

interface ElbStackProps extends StackProps {
  readonly prefix: string;
  readonly stage: string;
  readonly cluster: Cluster;
  readonly ecsService: FargateService;
}

class ElbStack extends Stack {
  constructor(scope: Construct, id: string, props: ElbStackProps) {
    super(scope, id, props);

    /**
     * Get var from props
     */
    const { prefix, stage, cluster, ecsService } = props;

    const lb = new ApplicationLoadBalancer(this, "LoadBalancer", {
      loadBalancerName: `${prefix}-${stage}-LoadBalancer`,
      vpc: cluster.vpc,
      internetFacing: true,
    });

    const listener = lb.addListener("Listener", { port: 80 });

    const targetGroup = listener.addTargets("ECS", {
      protocol: ApplicationProtocol.HTTP,
      port: 3000,
      targets: [ecsService],
    });

    /**
     * Cfn Ouput
     */
    this.createCfnOutput({
      id: `${prefix}-${stage}-LoadBalancer-DNS`,
      value: lb.loadBalancerDnsName,
    });
    this.createCfnOutput({
      id: `${prefix}-${stage}-LoadBalancer-Arn`,
      value: lb.loadBalancerArn,
    });
  }

  /**
   * Create Cloudformation Output
   * @param param0
   */
  private createCfnOutput({ id, value }: { id: string; value: string }) {
    new CfnOutput(this, id, { value });
  }
}

export { ElbStack };
