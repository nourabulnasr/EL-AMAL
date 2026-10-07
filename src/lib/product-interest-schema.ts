// Kept separate so the real migration can be exercised in disposable schemas.
export const interestSchema=`CREATE TABLE product_interest (
  session_hash varchar(64) NOT NULL CHECK (session_hash ~ '^[a-f0-9]{64}$'),
  product_id integer NOT NULL CHECK(product_id>0), model varchar(240) NOT NULL,
  locale varchar(2) NOT NULL CHECK(locale IN ('en','ar')),
  device varchar(7) NOT NULL CHECK(device IN ('mobile','desktop')),
  list varchar(12) NOT NULL CHECK(list IN ('catalogue','category','search','home','related','detail')),
  impression_at timestamptz, selection_at timestamptz, view_at timestamptz, basket_at timestamptz, datasheet_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL DEFAULT now()+interval '93 days',
  PRIMARY KEY(session_hash,product_id,locale,device,list)
);
CREATE INDEX product_interest_expiry_idx ON product_interest(expires_at);
CREATE INDEX product_interest_created_idx ON product_interest(created_at);
`;
