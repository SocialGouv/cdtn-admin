import { ErrorMessage } from "@hookform/error-message";
import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { IoMdCheckmark } from "react-icons/io";
import { Box, Field, Flex, Label, NavLink, Radio, Textarea } from "theme-ui";

import { Content, ContentSection, SectionDisplayMode } from "../../types";
import { Button } from "../button";
import { FormErrorMessage } from "../forms/ErrorMessage";
import { MarkdownLink } from "../MarkdownLink";
import { ContentSections } from "./ContentSections";
import { ReferenceBlocks } from "./ReferenceBlocks";

const addComputedFields =
  (onSubmit: (content: Partial<Content>) => void) =>
  (data: Partial<Content>) => {
    data.document?.references?.forEach((block) => {
      block.links.forEach((link) => {
        link.id = slugify(link.title);
        link.type = SOURCES.EXTERNALS;
      });
    });
    data.document?.contents?.forEach((content: ContentSection) => {
      content.name = slugify(content.title as string);
      content.references?.forEach((block) => {
        block.links.forEach((reference) => {
          reference.id = slugify(reference.title);
          reference.type = SOURCES.EXTERNALS;
        });
      });
    });
    onSubmit(data);
  };

const EditorialContentForm = ({
  onSubmit,
  loading = false,
  content,
}: {
  onSubmit: any;
  loading: boolean;
  content?: Partial<Content>;
}) => {
  const router = useRouter();
  const {
    control,
    register,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<Content>({
    defaultValues: content,
  });
  const hasError = Object.keys(errors).length > 0;
  let buttonLabel = "Créer le contenu";
  if (!content) {
    content = {
      document: { contents: [{ type: "markdown" }] },
    };
  }
  if (content?.cdtnId) {
    buttonLabel = "Enregistrer les changements";
  }
  return (
    <form onSubmit={handleSubmit(addComputedFields(onSubmit))}>
      <>
        <Box mb="small">
          <Field
            {...register("document.date", {
              validate: (value?: string) => {
                if (!value) return false;
                const trimmed = value.trim();
                return /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(trimmed);
              },
            })}
            name="document.date"
            sx={{ width: "10rem" }}
            label="Date"
          />
          <ErrorMessage
            name="document.date"
            errors={errors}
            render={() => (
              <Box color="critical">
                La date n’est pas formatée correctement. Le format attendu est
                &quot;jour/mois/année&quot;
              </Box>
            )}
          />
        </Box>
        <Box mb="small">
          <Field
            {...register("title", {
              required: { message: "Le titre est requis", value: true },
            })}
            type="text"
            label="Titre"
          />
          <FormErrorMessage errors={errors} fieldName="title" />
        </Box>

        <Box mb="small">
          <Field
            {...register("metaDescription")}
            type="text"
            label="Meta description (référencement)"
          />
        </Box>

        <Box mb="small">
          <Label htmlFor={"description"}>Description</Label>
          <Textarea
            {...register("document.description", {
              required: { message: "La description est requise", value: true },
            })}
            id="description"
            rows={3}
          />
          <FormErrorMessage errors={errors} fieldName="document.description" />
        </Box>
        <Box mb="small">
          <Label htmlFor={"intro"}>
            Introduction&nbsp;
            <MarkdownLink />
          </Label>
          <Textarea {...register("document.intro")} id="intro" rows={3} />
        </Box>
        <Box mb="small">
          <Label htmlFor={"intro"}>Affichage des sections&nbsp;</Label>
          <Label>
            <Radio
              {...register("document.sectionDisplayMode")}
              name="document.sectionDisplayMode"
              value={SectionDisplayMode.accordion}
              defaultChecked={!content?.document?.sectionDisplayMode}
            />
            Accordéon
          </Label>
          <Label>
            <Radio
              {...register("document.sectionDisplayMode")}
              name="document.sectionDisplayMode"
              value={SectionDisplayMode.tab}
            />
            Onglet
          </Label>
        </Box>
        <ContentSections
          control={control}
          register={register}
          name="document.contents"
          errors={errors}
        />
        <Flex sx={{ justifyContent: "flex-end", width: "100%" }}>
          <ReferenceBlocks
            control={control}
            register={register}
            name="document.references"
            errors={errors}
          />
        </Flex>

        <Flex mt="medium" sx={{ alignItems: "center" }}>
          <Button
            variant="secondary"
            //@ts-ignore
            disabled={hasError || loading || !isDirty}
          >
            {isDirty && (
              <IoMdCheckmark
                sx={{
                  height: "iconSmall",
                  mr: "xsmall",
                  width: "iconSmall",
                }}
              />
            )}
            {buttonLabel}
          </Button>
          <Link href={"/contenus"} passHref>
            <NavLink
              onClick={(e) => {
                e.preventDefault();
                router.back();
              }}
              ml="medium"
            >
              Annuler
            </NavLink>
          </Link>
        </Flex>
      </>
    </form>
  );
};

export { EditorialContentForm };
