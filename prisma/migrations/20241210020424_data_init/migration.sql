-- CreateTable
CREATE TABLE "Statut" (
    "idstatut" TEXT NOT NULL,
    "codestatut" VARCHAR(255) NOT NULL,
    "nomstatut" VARCHAR(255) NOT NULL,
    "descriptionstatut" TEXT,
    "published" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Statut_pkey" PRIMARY KEY ("idstatut")
);

-- CreateTable
CREATE TABLE "Profession" (
    "idprofession" TEXT NOT NULL,
    "codeprofession" VARCHAR(255) NOT NULL,
    "libelleprofession" VARCHAR(255) NOT NULL,
    "descriptionsprofession" TEXT,
    "published" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profession_pkey" PRIMARY KEY ("idprofession")
);

-- CreateTable
CREATE TABLE "Qualite" (
    "idqualite" TEXT NOT NULL,
    "codequalite" VARCHAR(255) NOT NULL,
    "libellequalite" VARCHAR(255) NOT NULL,
    "descriptionsqualite" TEXT,
    "published" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Qualite_pkey" PRIMARY KEY ("idqualite")
);

-- CreateTable
CREATE TABLE "Activite" (
    "idactivite" TEXT NOT NULL,
    "codeactivite" VARCHAR(255) NOT NULL,
    "dateactivite" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descriptionactivite" TEXT,
    "published" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false,

    CONSTRAINT "Activite_pkey" PRIMARY KEY ("idactivite")
);

-- CreateTable
CREATE TABLE "Agence" (
    "idagence" TEXT NOT NULL,
    "nomagence" VARCHAR(255) NOT NULL,
    "codeagence" VARCHAR(255) NOT NULL,
    "responsableagence" VARCHAR(255),
    "emailagence" VARCHAR(255),
    "siteagence" VARCHAR(255),
    "phoneagence" VARCHAR(255),
    "faxagence" VARCHAR(255),
    "longitudeagence" VARCHAR(255),
    "latitudeagence" VARCHAR(255),
    "descriptionagence" TEXT,
    "adresseagence" TEXT,
    "published" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false,

    CONSTRAINT "Agence_pkey" PRIMARY KEY ("idagence")
);

-- CreateTable
CREATE TABLE "Prestataire" (
    "idprestataire" TEXT NOT NULL,
    "codeprestataire" VARCHAR(255) NOT NULL,
    "nomprestataire" VARCHAR(255) NOT NULL,
    "responsableprestataire" VARCHAR(255),
    "emailprestataire" VARCHAR(255),
    "siteprestataire" VARCHAR(255),
    "phoneprestataire" VARCHAR(255),
    "faxprestataire" VARCHAR(255),
    "longitudeprestataire" VARCHAR(255),
    "latitudeprestataire" VARCHAR(255),
    "descriptionprestataire" TEXT,
    "adresseprestataire" TEXT,
    "published" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "statutId" TEXT NOT NULL,

    CONSTRAINT "Prestataire_pkey" PRIMARY KEY ("idprestataire")
);

-- CreateTable
CREATE TABLE "Assure" (
    "idassure" TEXT NOT NULL,
    "codeassure" VARCHAR(255) NOT NULL,
    "nomassure" VARCHAR(255) NOT NULL,
    "prenomassure" VARCHAR(255),
    "emailassure" VARCHAR(255),
    "siteassure" VARCHAR(255),
    "phoneassure" VARCHAR(255),
    "gsmassure" VARCHAR(255),
    "faxassure" VARCHAR(255),
    "descriptionassure" TEXT,
    "adresseassure" TEXT,
    "qualiteId" TEXT NOT NULL,
    "professionId" TEXT NOT NULL,
    "published" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assure_pkey" PRIMARY KEY ("idassure")
);

-- CreateTable
CREATE TABLE "Energie" (
    "idenergie" TEXT NOT NULL,
    "codeenergie" VARCHAR(255) NOT NULL,
    "nomenergie" VARCHAR(255) NOT NULL,
    "descriptionenergie" TEXT,
    "published" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Energie_pkey" PRIMARY KEY ("idenergie")
);

-- CreateTable
CREATE TABLE "Marque" (
    "idmarque" TEXT NOT NULL,
    "codemarque" VARCHAR(255) NOT NULL,
    "nommarque" VARCHAR(255) NOT NULL,
    "descriptionmarque" TEXT,
    "published" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Marque_pkey" PRIMARY KEY ("idmarque")
);

-- CreateTable
CREATE TABLE "Modele" (
    "idmodele" TEXT NOT NULL,
    "codemodele" VARCHAR(255) NOT NULL,
    "nommodele" VARCHAR(255) NOT NULL,
    "descriptionmodele" TEXT,
    "published" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Modele_pkey" PRIMARY KEY ("idmodele")
);

-- CreateTable
CREATE TABLE "Tpuissance" (
    "idpuissance" TEXT NOT NULL,
    "codepuissance" VARCHAR(255) NOT NULL,
    "nompuissance" VARCHAR(255) NOT NULL,
    "puissance_from" INTEGER,
    "puissance_to" INTEGER,
    "published" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tpuissance_pkey" PRIMARY KEY ("idpuissance")
);

-- CreateTable
CREATE TABLE "Tdocument" (
    "idtdoc" TEXT NOT NULL,
    "codetdoc" VARCHAR(255) NOT NULL,
    "nomtdoc" VARCHAR(255) NOT NULL,
    "descriptiontdoc" TEXT,
    "published" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tdocument_pkey" PRIMARY KEY ("idtdoc")
);

-- CreateTable
CREATE TABLE "Garantie" (
    "idgarantie" TEXT NOT NULL,
    "codegarantie" VARCHAR(255) NOT NULL,
    "nomgarantie" VARCHAR(255) NOT NULL,
    "photogarantie" VARCHAR(255),
    "descriptiongarantie" TEXT,
    "published" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Garantie_pkey" PRIMARY KEY ("idgarantie")
);

-- CreateTable
CREATE TABLE "GarantiePT" (
    "idgarantiept" TEXT NOT NULL,
    "codegarantiept" VARCHAR(255) NOT NULL,
    "nomgarantiept" VARCHAR(255) NOT NULL,
    "photogarantiept" VARCHAR(255),
    "descriptiongarantiept" TEXT,
    "published" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GarantiePT_pkey" PRIMARY KEY ("idgarantiept")
);

-- CreateTable
CREATE TABLE "FormulePT" (
    "idformulept" TEXT NOT NULL,
    "codeformulept" VARCHAR(255) NOT NULL,
    "nomformulept" VARCHAR(255) NOT NULL,
    "photoformulept" VARCHAR(255),
    "montantformulept" INTEGER,
    "descriptionformulept" TEXT,
    "published" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormulePT_pkey" PRIMARY KEY ("idformulept")
);

-- CreateTable
CREATE TABLE "FormulePtGarantiePt" (
    "idfg" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "garantiePtId" TEXT NOT NULL,
    "formulePtId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormulePtGarantiePt_pkey" PRIMARY KEY ("idfg")
);

-- CreateTable
CREATE TABLE "Pack" (
    "idpack" TEXT NOT NULL,
    "codepack" VARCHAR(255) NOT NULL,
    "nompack" VARCHAR(255) NOT NULL,
    "photopack" VARCHAR(255),
    "ordrepack" INTEGER,
    "descriptionpack" TEXT,
    "withPT" BOOLEAN DEFAULT false,
    "cpEqVv" BOOLEAN DEFAULT false,
    "published" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pack_pkey" PRIMARY KEY ("idpack")
);

-- CreateTable
CREATE TABLE "PackGarantie" (
    "idpg" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "garantieId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackGarantie_pkey" PRIMARY KEY ("idpg")
);

-- CreateTable
CREATE TABLE "PackTdoc" (
    "idpt" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "tdocId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackTdoc_pkey" PRIMARY KEY ("idpt")
);

-- CreateTable
CREATE TABLE "Tage" (
    "idtage" TEXT NOT NULL,
    "codetage" VARCHAR(255) NOT NULL,
    "nomtage" VARCHAR(255) NOT NULL,
    "age_from" INTEGER,
    "age_to" INTEGER,
    "descriptiontage" TEXT,
    "published" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tage_pkey" PRIMARY KEY ("idtage")
);

-- CreateTable
CREATE TABLE "PackTage" (
    "idpa" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "tageId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackTage_pkey" PRIMARY KEY ("idpa")
);

-- CreateTable
CREATE TABLE "MethodePaiement" (
    "idmethode" TEXT NOT NULL,
    "nomMethode" VARCHAR(255) NOT NULL,
    "codeMethode" VARCHAR(255) NOT NULL,
    "descriptionMethode" TEXT,
    "name" VARCHAR(255),
    "merchantID" VARCHAR(255),
    "API_KEY" TEXT,
    "currencyCode" VARCHAR(255),
    "automaticRecurringPayment" VARCHAR(255),
    "placeholder1" VARCHAR(255),
    "placeholder2" VARCHAR(255),
    "placeholder3" VARCHAR(255),
    "published" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MethodePaiement_pkey" PRIMARY KEY ("idmethode")
);

-- CreateTable
CREATE TABLE "Parametre" (
    "idparametre" TEXT NOT NULL,
    "mailUserCreation" BOOLEAN DEFAULT false,
    "mailUserActivation" BOOLEAN DEFAULT false,
    "mailSouscriptionActivation" BOOLEAN DEFAULT false,
    "mailSouscriptionSuspension" BOOLEAN NOT NULL DEFAULT false,
    "mailDemandeCreation" BOOLEAN NOT NULL DEFAULT false,
    "nomcompagnie" VARCHAR(255),
    "logocompagnie" VARCHAR(255),
    "phonecompagnie" VARCHAR(255),
    "emailcompagnie" VARCHAR(255),
    "sitecompagnie" VARCHAR(255),
    "adressecompagnie" VARCHAR(255),
    "pgw_url" VARCHAR(255),
    "pgw_secret" VARCHAR(255),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parametre_pkey" PRIMARY KEY ("idparametre")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "idreset" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("idreset")
);

-- CreateTable
CREATE TABLE "Franchise" (
    "idfranchise" TEXT NOT NULL,
    "codefranchise" VARCHAR(255) NOT NULL,
    "nomafranchise" VARCHAR(255),
    "valeurafranchise" INTEGER,
    "descriptionfranchise" TEXT,
    "published" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Franchise_pkey" PRIMARY KEY ("idfranchise")
);

-- CreateTable
CREATE TABLE "Capitaux" (
    "idcapitaux" TEXT NOT NULL,
    "nomcapitaux" VARCHAR(255) NOT NULL,
    "codecapitaux" VARCHAR(255) NOT NULL,
    "valeurcapitaux" INTEGER,
    "descriptioncapitaux" TEXT,
    "published" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Capitaux_pkey" PRIMARY KEY ("idcapitaux")
);

-- CreateTable
CREATE TABLE "Prime" (
    "idprime" TEXT NOT NULL,
    "nomprime" VARCHAR(255) NOT NULL,
    "codeprime" VARCHAR(255) NOT NULL,
    "valeurprime" INTEGER,
    "tageId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "puissId" TEXT NOT NULL,
    "capitauxId" TEXT NOT NULL,
    "franchiseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "published" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,

    CONSTRAINT "Prime_pkey" PRIMARY KEY ("idprime")
);

-- CreateTable
CREATE TABLE "Ressource" (
    "idressource" TEXT NOT NULL,
    "rcode" TEXT NOT NULL,
    "nomressource" TEXT,
    "descriptionressource" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Ressource_pkey" PRIMARY KEY ("idressource")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "codeuser" VARCHAR(250) NOT NULL,
    "unom" VARCHAR(250),
    "uprenom" VARCHAR(250),
    "email_verified_at" DATE,
    "avatar" VARCHAR(250),
    "usession" VARCHAR(250),
    "ressourceId" TEXT,
    "prestataireId" TEXT,
    "agenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false,
    "published" BOOLEAN DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "iddocument" TEXT NOT NULL,
    "nomDocument" VARCHAR(255),
    "codeDocument" VARCHAR(255) NOT NULL,
    "descriptionDocument" TEXT,
    "published" BOOLEAN DEFAULT false,
    "imported" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("iddocument")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "hashedToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicule" (
    "idvehicule" TEXT NOT NULL,
    "dateMiseCirdulation" DATE,
    "valeurNeuve" INTEGER,
    "valeurvenale" INTEGER,
    "typeTransport" VARCHAR(255) NOT NULL,
    "nbPlace" INTEGER,
    "nbPlaceAssure" INTEGER,
    "nbPlaceSupprime" INTEGER,
    "immatriculation" VARCHAR(255) NOT NULL,
    "marqueId" TEXT NOT NULL,
    "modeleId" TEXT NOT NULL,
    "energieId" TEXT NOT NULL,
    "puissanceId" TEXT NOT NULL,
    "cotationId" TEXT NOT NULL,
    "descriptionDocument" TEXT,
    "photo1" VARCHAR(255),
    "photo2" VARCHAR(255),
    "photo3" VARCHAR(255),
    "photo4" VARCHAR(255),
    "published" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicule_pkey" PRIMARY KEY ("idvehicule")
);

-- CreateTable
CREATE TABLE "Cotation" (
    "idcotation" TEXT NOT NULL,
    "codecotation" VARCHAR(255) NOT NULL,
    "typecotation" VARCHAR(255) NOT NULL,
    "dureMois" INTEGER,
    "dureeJours" INTEGER,
    "dateEffet" DATE,
    "dateEcheance" DATE,
    "reductionBNS" REAL,
    "reductionCommerciale" REAL,
    "descriptioncotation" TEXT,
    "lieuCotation" TEXT,
    "assureId" TEXT NOT NULL,
    "statutId" TEXT NOT NULL,
    "prestataireId" TEXT NOT NULL,
    "primeId" TEXT NOT NULL,
    "published" BOOLEAN DEFAULT false,
    "isDeleted" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cotation_pkey" PRIMARY KEY ("idcotation")
);

-- CreateTable
CREATE TABLE "CotationGarantie" (
    "idcg" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "garantieId" TEXT NOT NULL,
    "cotationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CotationGarantie_pkey" PRIMARY KEY ("idcg")
);

-- CreateIndex
CREATE UNIQUE INDEX "Statut_idstatut_key" ON "Statut"("idstatut");

-- CreateIndex
CREATE UNIQUE INDEX "Statut_codestatut_key" ON "Statut"("codestatut");

-- CreateIndex
CREATE UNIQUE INDEX "Statut_nomstatut_key" ON "Statut"("nomstatut");

-- CreateIndex
CREATE UNIQUE INDEX "Profession_idprofession_key" ON "Profession"("idprofession");

-- CreateIndex
CREATE UNIQUE INDEX "Profession_codeprofession_key" ON "Profession"("codeprofession");

-- CreateIndex
CREATE UNIQUE INDEX "Profession_libelleprofession_key" ON "Profession"("libelleprofession");

-- CreateIndex
CREATE UNIQUE INDEX "Qualite_idqualite_key" ON "Qualite"("idqualite");

-- CreateIndex
CREATE UNIQUE INDEX "Qualite_codequalite_key" ON "Qualite"("codequalite");

-- CreateIndex
CREATE UNIQUE INDEX "Qualite_libellequalite_key" ON "Qualite"("libellequalite");

-- CreateIndex
CREATE UNIQUE INDEX "Activite_idactivite_key" ON "Activite"("idactivite");

-- CreateIndex
CREATE UNIQUE INDEX "Activite_codeactivite_key" ON "Activite"("codeactivite");

-- CreateIndex
CREATE UNIQUE INDEX "Agence_idagence_key" ON "Agence"("idagence");

-- CreateIndex
CREATE UNIQUE INDEX "Agence_nomagence_key" ON "Agence"("nomagence");

-- CreateIndex
CREATE UNIQUE INDEX "Agence_codeagence_key" ON "Agence"("codeagence");

-- CreateIndex
CREATE UNIQUE INDEX "Prestataire_idprestataire_key" ON "Prestataire"("idprestataire");

-- CreateIndex
CREATE UNIQUE INDEX "Prestataire_codeprestataire_key" ON "Prestataire"("codeprestataire");

-- CreateIndex
CREATE UNIQUE INDEX "Prestataire_nomprestataire_key" ON "Prestataire"("nomprestataire");

-- CreateIndex
CREATE UNIQUE INDEX "Assure_idassure_key" ON "Assure"("idassure");

-- CreateIndex
CREATE UNIQUE INDEX "Assure_codeassure_key" ON "Assure"("codeassure");

-- CreateIndex
CREATE UNIQUE INDEX "Energie_idenergie_key" ON "Energie"("idenergie");

-- CreateIndex
CREATE UNIQUE INDEX "Energie_codeenergie_key" ON "Energie"("codeenergie");

-- CreateIndex
CREATE UNIQUE INDEX "Energie_nomenergie_key" ON "Energie"("nomenergie");

-- CreateIndex
CREATE UNIQUE INDEX "Marque_idmarque_key" ON "Marque"("idmarque");

-- CreateIndex
CREATE UNIQUE INDEX "Marque_codemarque_key" ON "Marque"("codemarque");

-- CreateIndex
CREATE UNIQUE INDEX "Marque_nommarque_key" ON "Marque"("nommarque");

-- CreateIndex
CREATE UNIQUE INDEX "Modele_idmodele_key" ON "Modele"("idmodele");

-- CreateIndex
CREATE UNIQUE INDEX "Modele_codemodele_key" ON "Modele"("codemodele");

-- CreateIndex
CREATE UNIQUE INDEX "Modele_nommodele_key" ON "Modele"("nommodele");

-- CreateIndex
CREATE UNIQUE INDEX "Tpuissance_idpuissance_key" ON "Tpuissance"("idpuissance");

-- CreateIndex
CREATE UNIQUE INDEX "Tpuissance_codepuissance_key" ON "Tpuissance"("codepuissance");

-- CreateIndex
CREATE UNIQUE INDEX "Tdocument_idtdoc_key" ON "Tdocument"("idtdoc");

-- CreateIndex
CREATE UNIQUE INDEX "Tdocument_codetdoc_key" ON "Tdocument"("codetdoc");

-- CreateIndex
CREATE UNIQUE INDEX "Garantie_idgarantie_key" ON "Garantie"("idgarantie");

-- CreateIndex
CREATE UNIQUE INDEX "Garantie_codegarantie_key" ON "Garantie"("codegarantie");

-- CreateIndex
CREATE UNIQUE INDEX "Garantie_photogarantie_key" ON "Garantie"("photogarantie");

-- CreateIndex
CREATE UNIQUE INDEX "GarantiePT_idgarantiept_key" ON "GarantiePT"("idgarantiept");

-- CreateIndex
CREATE UNIQUE INDEX "GarantiePT_codegarantiept_key" ON "GarantiePT"("codegarantiept");

-- CreateIndex
CREATE UNIQUE INDEX "GarantiePT_photogarantiept_key" ON "GarantiePT"("photogarantiept");

-- CreateIndex
CREATE UNIQUE INDEX "FormulePT_idformulept_key" ON "FormulePT"("idformulept");

-- CreateIndex
CREATE UNIQUE INDEX "FormulePT_codeformulept_key" ON "FormulePT"("codeformulept");

-- CreateIndex
CREATE UNIQUE INDEX "FormulePT_photoformulept_key" ON "FormulePT"("photoformulept");

-- CreateIndex
CREATE UNIQUE INDEX "FormulePtGarantiePt_idfg_key" ON "FormulePtGarantiePt"("idfg");

-- CreateIndex
CREATE UNIQUE INDEX "Pack_idpack_key" ON "Pack"("idpack");

-- CreateIndex
CREATE UNIQUE INDEX "Pack_codepack_key" ON "Pack"("codepack");

-- CreateIndex
CREATE UNIQUE INDEX "Pack_photopack_key" ON "Pack"("photopack");

-- CreateIndex
CREATE UNIQUE INDEX "PackGarantie_idpg_key" ON "PackGarantie"("idpg");

-- CreateIndex
CREATE UNIQUE INDEX "PackTdoc_idpt_key" ON "PackTdoc"("idpt");

-- CreateIndex
CREATE UNIQUE INDEX "Tage_idtage_key" ON "Tage"("idtage");

-- CreateIndex
CREATE UNIQUE INDEX "Tage_codetage_key" ON "Tage"("codetage");

-- CreateIndex
CREATE UNIQUE INDEX "PackTage_idpa_key" ON "PackTage"("idpa");

-- CreateIndex
CREATE UNIQUE INDEX "MethodePaiement_idmethode_key" ON "MethodePaiement"("idmethode");

-- CreateIndex
CREATE UNIQUE INDEX "MethodePaiement_nomMethode_key" ON "MethodePaiement"("nomMethode");

-- CreateIndex
CREATE UNIQUE INDEX "MethodePaiement_codeMethode_key" ON "MethodePaiement"("codeMethode");

-- CreateIndex
CREATE UNIQUE INDEX "MethodePaiement_merchantID_key" ON "MethodePaiement"("merchantID");

-- CreateIndex
CREATE UNIQUE INDEX "Parametre_idparametre_key" ON "Parametre"("idparametre");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_idreset_key" ON "PasswordReset"("idreset");

-- CreateIndex
CREATE UNIQUE INDEX "Franchise_idfranchise_key" ON "Franchise"("idfranchise");

-- CreateIndex
CREATE UNIQUE INDEX "Franchise_codefranchise_key" ON "Franchise"("codefranchise");

-- CreateIndex
CREATE UNIQUE INDEX "Capitaux_idcapitaux_key" ON "Capitaux"("idcapitaux");

-- CreateIndex
CREATE UNIQUE INDEX "Capitaux_nomcapitaux_key" ON "Capitaux"("nomcapitaux");

-- CreateIndex
CREATE UNIQUE INDEX "Capitaux_codecapitaux_key" ON "Capitaux"("codecapitaux");

-- CreateIndex
CREATE UNIQUE INDEX "Prime_idprime_key" ON "Prime"("idprime");

-- CreateIndex
CREATE UNIQUE INDEX "Prime_nomprime_key" ON "Prime"("nomprime");

-- CreateIndex
CREATE UNIQUE INDEX "Prime_codeprime_key" ON "Prime"("codeprime");

-- CreateIndex
CREATE UNIQUE INDEX "Ressource_idressource_key" ON "Ressource"("idressource");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Document_iddocument_key" ON "Document"("iddocument");

-- CreateIndex
CREATE UNIQUE INDEX "Document_codeDocument_key" ON "Document"("codeDocument");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_id_key" ON "RefreshToken"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicule_idvehicule_key" ON "Vehicule"("idvehicule");

-- CreateIndex
CREATE UNIQUE INDEX "Cotation_idcotation_key" ON "Cotation"("idcotation");

-- CreateIndex
CREATE UNIQUE INDEX "Cotation_codecotation_key" ON "Cotation"("codecotation");

-- CreateIndex
CREATE UNIQUE INDEX "CotationGarantie_idcg_key" ON "CotationGarantie"("idcg");

-- AddForeignKey
ALTER TABLE "Prestataire" ADD CONSTRAINT "Prestataire_statutId_fkey" FOREIGN KEY ("statutId") REFERENCES "Statut"("idstatut") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Assure" ADD CONSTRAINT "Assure_qualiteId_fkey" FOREIGN KEY ("qualiteId") REFERENCES "Qualite"("idqualite") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Assure" ADD CONSTRAINT "Assure_professionId_fkey" FOREIGN KEY ("professionId") REFERENCES "Profession"("idprofession") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FormulePtGarantiePt" ADD CONSTRAINT "FormulePtGarantiePt_garantiePtId_fkey" FOREIGN KEY ("garantiePtId") REFERENCES "GarantiePT"("idgarantiept") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FormulePtGarantiePt" ADD CONSTRAINT "FormulePtGarantiePt_formulePtId_fkey" FOREIGN KEY ("formulePtId") REFERENCES "FormulePT"("idformulept") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PackGarantie" ADD CONSTRAINT "PackGarantie_garantieId_fkey" FOREIGN KEY ("garantieId") REFERENCES "Garantie"("idgarantie") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PackGarantie" ADD CONSTRAINT "PackGarantie_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack"("idpack") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PackTdoc" ADD CONSTRAINT "PackTdoc_tdocId_fkey" FOREIGN KEY ("tdocId") REFERENCES "Tdocument"("idtdoc") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PackTdoc" ADD CONSTRAINT "PackTdoc_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack"("idpack") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PackTage" ADD CONSTRAINT "PackTage_tageId_fkey" FOREIGN KEY ("tageId") REFERENCES "Tage"("idtage") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PackTage" ADD CONSTRAINT "PackTage_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack"("idpack") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Prime" ADD CONSTRAINT "Prime_tageId_fkey" FOREIGN KEY ("tageId") REFERENCES "Tage"("idtage") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Prime" ADD CONSTRAINT "Prime_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Pack"("idpack") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Prime" ADD CONSTRAINT "Prime_puissId_fkey" FOREIGN KEY ("puissId") REFERENCES "Tpuissance"("idpuissance") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Prime" ADD CONSTRAINT "Prime_capitauxId_fkey" FOREIGN KEY ("capitauxId") REFERENCES "Capitaux"("idcapitaux") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Prime" ADD CONSTRAINT "Prime_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "Franchise"("idfranchise") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_ressourceId_fkey" FOREIGN KEY ("ressourceId") REFERENCES "Ressource"("idressource") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_prestataireId_fkey" FOREIGN KEY ("prestataireId") REFERENCES "Prestataire"("idprestataire") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "Agence"("idagence") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicule" ADD CONSTRAINT "Vehicule_marqueId_fkey" FOREIGN KEY ("marqueId") REFERENCES "Marque"("idmarque") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Vehicule" ADD CONSTRAINT "Vehicule_modeleId_fkey" FOREIGN KEY ("modeleId") REFERENCES "Modele"("idmodele") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Vehicule" ADD CONSTRAINT "Vehicule_energieId_fkey" FOREIGN KEY ("energieId") REFERENCES "Energie"("idenergie") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Vehicule" ADD CONSTRAINT "Vehicule_puissanceId_fkey" FOREIGN KEY ("puissanceId") REFERENCES "Tpuissance"("idpuissance") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Vehicule" ADD CONSTRAINT "Vehicule_cotationId_fkey" FOREIGN KEY ("cotationId") REFERENCES "Cotation"("idcotation") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Cotation" ADD CONSTRAINT "Cotation_assureId_fkey" FOREIGN KEY ("assureId") REFERENCES "Assure"("idassure") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Cotation" ADD CONSTRAINT "Cotation_statutId_fkey" FOREIGN KEY ("statutId") REFERENCES "Statut"("idstatut") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Cotation" ADD CONSTRAINT "Cotation_prestataireId_fkey" FOREIGN KEY ("prestataireId") REFERENCES "Prestataire"("idprestataire") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Cotation" ADD CONSTRAINT "Cotation_primeId_fkey" FOREIGN KEY ("primeId") REFERENCES "Prime"("idprime") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CotationGarantie" ADD CONSTRAINT "CotationGarantie_garantieId_fkey" FOREIGN KEY ("garantieId") REFERENCES "Garantie"("idgarantie") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CotationGarantie" ADD CONSTRAINT "CotationGarantie_cotationId_fkey" FOREIGN KEY ("cotationId") REFERENCES "Cotation"("idcotation") ON DELETE NO ACTION ON UPDATE NO ACTION;
