import type { StructureResolver } from 'sanity/structure';
import { BrokerDashboard } from './components/BrokerDashboard';
import { BlogPostDashboard } from './components/BlogPostDashboard';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // === BROKER ===
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

      S.divider(),

      // === BLOG ===
      S.listItem()
        .title('Blog Posts')
        .icon(() => '📝')
        .child(
          S.component(BlogPostDashboard)
            .title('Blog Posts Dashboard')
        ),
      S.listItem()
        .title('Authors')
        .icon(() => '👤')
        .child(
          S.documentTypeList('author').title('Authors')
        ),
      S.listItem()
        .title('Blog Categories')
        .icon(() => '🗂️')
        .child(
          S.documentTypeList('blogCategory').title('Blog Categories')
        ),
      S.listItem()
        .title('Blog Tags')
        .icon(() => '🏷️')
        .child(
          S.documentTypeList('blogTag').title('Blog Tags')
        ),
    ]);
