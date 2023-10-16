import Image from "next/image";
import Link from "next/link";
import { personal } from "@/db";

export default function Home() {
  return (
    <div className="min-h-screen dark:bg-slate-800">
      <div className="items-center justify-between px-5 sm:px-10 max-w-3xl mx-auto dark:bg-slate-800">
        <p className={` dark:text-white mt-10`}>
          Hai is a software developer based in Hanoi, Vietnam. He is interested
          in Infrastructure as Code with CDK, Data and Machine Learning
          Engineering on AWS. He creates this blog{" "}
          <Link
            href={"https://cdk.entest.io"}
            target="_blank"
            color="red"
            className="dark:text-pink-500 text-blue-600"
          >
            cdk.entest.io
          </Link>{" "}
          to learn and share.
        </p>
        <div className="columns-2 sm:columns-3 gap-4 mt-8">
          <div className="relative h-40 mb-4">
            <Image
              alt="Me speaking on stage at React Summit about the future of Next.js"
              src={personal[0].image}
              fill
              sizes="(max-width: 768px) 213px, 33vw"
              priority
              className="rounded-lg object-cover"
              unoptimized
            />
          </div>
          <div className="relative h-80 mb-4 sm:mb-0">
            <Image
              alt="Me, Lydia, and Delba filming the Next.js Conf keynote"
              src={personal[1].image}
              fill
              sizes="(max-width: 768px) 213px, 33vw"
              priority
              className="rounded-lg object-cover object-[-16px] sm:object-center"
              unoptimized
            />
          </div>
          <div className="relative h-40 sm:h-80 sm:mb-4">
            <Image
              alt="Me standing on stage at Reactathon delivering the keynote"
              src={personal[2].image}
              fill
              sizes="(max-width: 768px) 213px, 33vw"
              priority
              className="rounded-lg object-cover object-top sm:object-center"
              unoptimized
            />
          </div>
          <div className="relative h-40 mb-4 sm:mb-0">
            <Image
              alt="Me standing on stage at SmashingConf giving a talk about my optimism for the web"
              src={personal[3].image}
              fill
              sizes="(max-width: 768px) 213px, 33vw"
              priority
              className="rounded-lg object-cover"
              unoptimized
            />
          </div>
          <div className="relative h-40 mb-4">
            <Image
              alt="Me and Guillermo Rauch on stage for Vercel Ship, answering questions from the Next.js community"
              src={personal[4].image}
              fill
              sizes="(max-width: 768px) 213px, 33vw"
              priority
              className="rounded-lg object-cover"
              unoptimized
            />
          </div>
          <div className="relative h-80">
            <Image
              alt="My badge on top of a pile of badges from a Vercel meetup we held"
              src={personal[5].image}
              fill
              sizes="(min-width: 768px) 213px, 33vw"
              priority
              className="rounded-lg object-cover"
              unoptimized
            />
          </div>
        </div>
      </div>
    </div>
  );
}
