import Image from 'next/image';
import type { Author } from '@/types/author';

interface AuthorBioProps {
  author: Author;
}

export default function AuthorBio({ author }: AuthorBioProps) {
  if (!author) return null;

  return (
    <section className="author-bio" aria-label="About the author">
      <div className="author-bio__inner">
        {author.avatarUrl && (
          <div className="author-bio__avatar">
            <Image
              src={author.avatarUrl}
              alt={author.avatarAlt || author.name}
              width={72}
              height={72}
              style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: '50%' }}
            />
          </div>
        )}
        <div className="author-bio__content">
          <h3 className="author-bio__name">{author.name}</h3>
          {author.role && <p className="author-bio__role">{author.role}</p>}
          {author.bio && <p className="author-bio__text">{author.bio}</p>}
          {author.socialLinks && author.socialLinks.length > 0 && (
            <ul className="author-bio__socials">
              {author.socialLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    aria-label={`${author.name} on ${link.platform}`}
                  >
                    {link.platform}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
