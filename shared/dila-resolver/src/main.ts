import { DilaApiClient } from "@socialgouv/dila-api-client";

import { createGetArticleReference, extractArticleId } from "./index";

async function main() {
  const urls = [
    "https://legifrance.gouv.fr/conv_coll/id/KALIARTI000005849401/?idConteneur=KALICONT000005635624",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042683537/",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006901138",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006901138/",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006901023/",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036762096",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006901000",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000019071122",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036762096",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000019071187/",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000029946319",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033013454",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037385300",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033020373",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033020373",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000042674204/2020-12-16",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037386025/ ",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000019071093",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000029144958",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037389712",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037389712",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037389712",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000026268379",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033020775/",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006902858/",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000036483206",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018537556",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018537474/",
    "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000036336556?r=3x6RHzoown",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000018537552",
    "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000036336556?r=3x6RHzoown",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000019071185",
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033024893",
  ];
  const articlesId = urls.flatMap(extractArticleId);
  const getArticleReference = createGetArticleReference(new DilaApiClient());
  const id = articlesId[Math.round(Math.random() * (articlesId.length - 1))];
  console.log(`fetch ${id} version`);
  const result = await getArticleReference(id);
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  void main();
}
