import type { StructureResolver } from 'sanity/structure';
import { BrokerDashboard } from './components/BrokerDashboard';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Brokers')
        .icon(() => '🏦')
        .child(
          S.component(BrokerDashboard)
            .title('Brokers Dashboard')
        ),
      S.divider(),
      S.listItem()
        .title('Broker Reviews')
        .child(
          S.documentTypeList('brokerReview').title('Broker Reviews')
        ),
      S.listItem()
        .title('Blog Posts')
        .child(
          S.documentTypeList('blogPost').title('Blog Posts')
        ),
    ]);
