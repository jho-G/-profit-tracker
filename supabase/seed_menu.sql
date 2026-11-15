-- Seed and update Liyu Shiro Menu (63 Items from physical photo menu)
DO $$
DECLARE
    v_restaurant_id uuid;
BEGIN
    -- 1. Ensure Liyu Shiro restaurant exists
    SELECT id INTO v_restaurant_id FROM public.restaurants WHERE name ILIKE '%Liyu Shiro%' OR name ILIKE '%ልዩ ሽሮ%' LIMIT 1;
    
    IF v_restaurant_id IS NULL THEN
        SELECT id INTO v_restaurant_id FROM public.restaurants LIMIT 1;
    END IF;

    IF v_restaurant_id IS NULL THEN
        INSERT INTO public.restaurants (name) VALUES ('ልዩ ሽሮ (Liyu Shiro)') RETURNING id INTO v_restaurant_id;
    END IF;

    -- 2. Upsert each menu item

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ፍርፍር') THEN
        UPDATE public.products
        SET category = 'የጾም ቁርስ',
            selling_price = 250.0,
            cost_price = 150.0,
            description = 'በበርበሬ እና በቅመም የተቁላላ የኢንጀራ ፍርፍር / Traditional spiced torn injera in savory berbere sauce',
            image_url = 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ፍርፍር';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ፍርፍር', 'የጾም ቁርስ', 250.0, 150.0, 'በበርበሬ እና በቅመም የተቁላላ የኢንጀራ ፍርፍር / Traditional spiced torn injera in savory berbere sauce', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ዳቦ ፍርፍር') THEN
        UPDATE public.products
        SET category = 'የጾም ቁርስ',
            selling_price = 180.0,
            cost_price = 100.0,
            description = 'በቅመም እና በዘይት የተቁላላ የዳቦ ፍርፍር / Fresh bread chunks tossed in spiced berbere reduction',
            image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ዳቦ ፍርፍር';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ዳቦ ፍርፍር', 'የጾም ቁርስ', 180.0, 100.0, 'በቅመም እና በዘይት የተቁላላ የዳቦ ፍርፍር / Fresh bread chunks tossed in spiced berbere reduction', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ፉል') THEN
        UPDATE public.products
        SET category = 'የጾም ቁርስ',
            selling_price = 200.0,
            cost_price = 120.0,
            description = 'የተፈጨ ባቄላ በቲማቲም፣ በሽንኩርት እና በቃሪያ / Simmered fava beans with diced onions, tomatoes, and jalapeños',
            image_url = 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ፉል';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ፉል', 'የጾም ቁርስ', 200.0, 120.0, 'የተፈጨ ባቄላ በቲማቲም፣ በሽንኩርት እና በቃሪያ / Simmered fava beans with diced onions, tomatoes, and jalapeños', 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ቂንጬ') THEN
        UPDATE public.products
        SET category = 'የጾም ቁርስ',
            selling_price = 210.0,
            cost_price = 120.0,
            description = 'በቅመም እና በዘይት የተዘጋጀ ጣፋጭ ስንዴ / Cracked wheat porridge gently cooked with aromatic spices',
            image_url = 'https://images.unsplash.com/photo-1586511925508-a4c6a7234978?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ቂንጬ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ቂንጬ', 'የጾም ቁርስ', 210.0, 120.0, 'በቅመም እና በዘይት የተዘጋጀ ጣፋጭ ስንዴ / Cracked wheat porridge gently cooked with aromatic spices', 'https://images.unsplash.com/photo-1586511925508-a4c6a7234978?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'በየአይነት') THEN
        UPDATE public.products
        SET category = 'የጾም ምሳ',
            selling_price = 290.0,
            cost_price = 170.0,
            description = 'ሽሮ፣ ምስር፣ አትክልት፣ ጎመን እና ሰላጣ በኢንጀራ / Platter of mixed fasting stews: shiro, misir, greens, and salad on injera',
            image_url = 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'በየአይነት';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'በየአይነት', 'የጾም ምሳ', 290.0, 170.0, 'ሽሮ፣ ምስር፣ አትክልት፣ ጎመን እና ሰላጣ በኢንጀራ / Platter of mixed fasting stews: shiro, misir, greens, and salad on injera', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ሽሮ') THEN
        UPDATE public.products
        SET category = 'የጾም ምሳ',
            selling_price = 250.0,
            cost_price = 140.0,
            description = 'በሽንኩርት እና በነጭ ሽንኩርት የተቁላላ የሽሮ ወጥ / Classic savory chickpea stew slow-cooked with garlic and spices',
            image_url = 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ሽሮ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ሽሮ', 'የጾም ምሳ', 250.0, 140.0, 'በሽንኩርት እና በነጭ ሽንኩርት የተቁላላ የሽሮ ወጥ / Classic savory chickpea stew slow-cooked with garlic and spices', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ስፔሻል ሽሮ') THEN
        UPDATE public.products
        SET category = 'የጾም ምሳ',
            selling_price = 290.0,
            cost_price = 170.0,
            description = 'ተጨማሪ ቅመማ ቅመሞች ያሉት የቤት ውስጥ ስፔሻል ሽሮ / House special shiro with rich aromatic seasoning',
            image_url = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ስፔሻል ሽሮ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ስፔሻል ሽሮ', 'የጾም ምሳ', 290.0, 170.0, 'ተጨማሪ ቅመማ ቅመሞች ያሉት የቤት ውስጥ ስፔሻል ሽሮ / House special shiro with rich aromatic seasoning', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ተጋቢኖ') THEN
        UPDATE public.products
        SET category = 'የጾም ምሳ',
            selling_price = 290.0,
            cost_price = 170.0,
            description = 'በሸክላ ድስት የሚንተከተክ ትኩስ ወፍራም ሽሮ / Thick, sizzling hot shiro stew served bubbly in traditional clay pot',
            image_url = 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ተጋቢኖ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ተጋቢኖ', 'የጾም ምሳ', 290.0, 170.0, 'በሸክላ ድስት የሚንተከተክ ትኩስ ወፍራም ሽሮ / Thick, sizzling hot shiro stew served bubbly in traditional clay pot', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ፓስታ በስጎ') THEN
        UPDATE public.products
        SET category = 'የጾም ምሳ',
            selling_price = 270.0,
            cost_price = 150.0,
            description = 'በቲማቲም ስጎ የተዘጋጀ ጣፋጭ ፓስታ / Spaghetti with seasoned Ethiopian style rich tomato sauce',
            image_url = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ፓስታ በስጎ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ፓስታ በስጎ', 'የጾም ምሳ', 270.0, 150.0, 'በቲማቲም ስጎ የተዘጋጀ ጣፋጭ ፓስታ / Spaghetti with seasoned Ethiopian style rich tomato sauce', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ስፔሻል ፓስታ') THEN
        UPDATE public.products
        SET category = 'የጾም ምሳ',
            selling_price = 370.0,
            cost_price = 220.0,
            description = 'በተመረጡ አትክልቶችና ቅመማ ቅመሞች የተዘጋጀ ስፔሻል ፓስታ / Chef''s special pasta loaded with herbs and roasted vegetables',
            image_url = 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ስፔሻል ፓስታ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ስፔሻል ፓስታ', 'የጾም ምሳ', 370.0, 220.0, 'በተመረጡ አትክልቶችና ቅመማ ቅመሞች የተዘጋጀ ስፔሻል ፓስታ / Chef''s special pasta loaded with herbs and roasted vegetables', 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ፓስታ በአትክልት') THEN
        UPDATE public.products
        SET category = 'የጾም ምሳ',
            selling_price = 290.0,
            cost_price = 160.0,
            description = 'በጥቅል ጎመን፣ ካሮትና ድንች የተጠበሰ ፓስታ / Pasta tossed with sauteed cabbage, carrots, and sweet peppers',
            image_url = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ፓስታ በአትክልት';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ፓስታ በአትክልት', 'የጾም ምሳ', 290.0, 160.0, 'በጥቅል ጎመን፣ ካሮትና ድንች የተጠበሰ ፓስታ / Pasta tossed with sauteed cabbage, carrots, and sweet peppers', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ተልባ ፍትፍት') THEN
        UPDATE public.products
        SET category = 'የጾም ምሳ',
            selling_price = 290.0,
            cost_price = 160.0,
            description = 'በተቆላ የተፈጨ ተልባና ቅመም የተበጠበጠ ፍትፍት / Roasted ground flaxseed broth tossed with torn injera',
            image_url = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ተልባ ፍትፍት';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ተልባ ፍትፍት', 'የጾም ምሳ', 290.0, 160.0, 'በተቆላ የተፈጨ ተልባና ቅመም የተበጠበጠ ፍትፍት / Roasted ground flaxseed broth tossed with torn injera', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ሃፍ ሃፍ') THEN
        UPDATE public.products
        SET category = 'የጾም ምሳ',
            selling_price = 290.0,
            cost_price = 160.0,
            description = 'ግማሽ ሽሮ እና ግማሽ ፍርፍር በአንድ ላይ / Favorite combo platter: half savory shiro and half spicy firfir',
            image_url = 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ሃፍ ሃፍ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ሃፍ ሃፍ', 'የጾም ምሳ', 290.0, 160.0, 'ግማሽ ሽሮ እና ግማሽ ፍርፍር በአንድ ላይ / Favorite combo platter: half savory shiro and half spicy firfir', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ቲማቲም') THEN
        UPDATE public.products
        SET category = 'የጾም ምሳ',
            selling_price = 250.0,
            cost_price = 140.0,
            description = 'ትኩስ የቲማቲም ሰላጣ በኢንጀራ ፍትፍት / Chilled diced tomatoes, onions, and jalapeños tossed with injera',
            image_url = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ቲማቲም';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ቲማቲም', 'የጾም ምሳ', 250.0, 140.0, 'ትኩስ የቲማቲም ሰላጣ በኢንጀራ ፍትፍት / Chilled diced tomatoes, onions, and jalapeños tossed with injera', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ድንች ወጥ') THEN
        UPDATE public.products
        SET category = 'የጾም ምሳ',
            selling_price = 290.0,
            cost_price = 160.0,
            description = 'በበርበሬና በቅመማ ቅመም የበሰለ ድንች ወጥ / Tender potato chunks simmered in aromatic berbere red stew',
            image_url = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ድንች ወጥ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ድንች ወጥ', 'የጾም ምሳ', 290.0, 160.0, 'በበርበሬና በቅመማ ቅመም የበሰለ ድንች ወጥ / Tender potato chunks simmered in aromatic berbere red stew', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ድርቆሽ ፍርፍር') THEN
        UPDATE public.products
        SET category = 'የጾም ምሳ',
            selling_price = 290.0,
            cost_price = 160.0,
            description = 'በስጎ የበሰለ የድርቆሽ ኢንጀራ ፍርፍር / Crisp dried injera pieces rehydrated in spiced berbere stew',
            image_url = 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ድርቆሽ ፍርፍር';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ድርቆሽ ፍርፍር', 'የጾም ምሳ', 290.0, 160.0, 'በስጎ የበሰለ የድርቆሽ ኢንጀራ ፍርፍር / Crisp dried injera pieces rehydrated in spiced berbere stew', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ምስር') THEN
        UPDATE public.products
        SET category = 'የጾም ምሳ',
            selling_price = 290.0,
            cost_price = 160.0,
            description = 'በበርበሬና ነጭ ሽንኩርት የበሰለ ቀይ ምስር ወጥ / Spiced split red lentil stew simmered with garlic and ginger',
            image_url = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ምስር';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ምስር', 'የጾም ምሳ', 290.0, 160.0, 'በበርበሬና ነጭ ሽንኩርት የበሰለ ቀይ ምስር ወጥ / Spiced split red lentil stew simmered with garlic and ginger', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'አገልግል (ሙሉ)') THEN
        UPDATE public.products
        SET category = 'የጾም ምሳ',
            selling_price = 550.0,
            cost_price = 320.0,
            description = 'ሙሉ ባህላዊ አገልግል በኢንጀራና በልዩ ልዩ ወጦች የተሞላ / Full traditional agelgil platter with assorted stews and rolls',
            image_url = 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'አገልግል (ሙሉ)';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'አገልግል (ሙሉ)', 'የጾም ምሳ', 550.0, 320.0, 'ሙሉ ባህላዊ አገልግል በኢንጀራና በልዩ ልዩ ወጦች የተሞላ / Full traditional agelgil platter with assorted stews and rolls', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'አገልግል (ግማሽ)') THEN
        UPDATE public.products
        SET category = 'የጾም ምሳ',
            selling_price = 400.0,
            cost_price = 240.0,
            description = 'ግማሽ ባህላዊ አገልግል ለብቻ ወይም ለሁለት / Half-portion traditional agelgil basket with fasting stews',
            image_url = 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'አገልግል (ግማሽ)';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'አገልግል (ግማሽ)', 'የጾም ምሳ', 400.0, 240.0, 'ግማሽ ባህላዊ አገልግል ለብቻ ወይም ለሁለት / Half-portion traditional agelgil basket with fasting stews', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'የጾም ማህበራዊ') THEN
        UPDATE public.products
        SET category = 'የጾም ምሳ',
            selling_price = 620.0,
            cost_price = 380.0,
            description = 'ለቡድን የሚሆን ትልቅ የጾም በየአይነት ማዕድ / Large shared group vegetarian banquet platter with all toppings',
            image_url = 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'የጾም ማህበራዊ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'የጾም ማህበራዊ', 'የጾም ምሳ', 620.0, 380.0, 'ለቡድን የሚሆን ትልቅ የጾም በየአይነት ማዕድ / Large shared group vegetarian banquet platter with all toppings', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ሩዝ በአትክልት') THEN
        UPDATE public.products
        SET category = 'የጾም ምሳ',
            selling_price = 360.0,
            cost_price = 210.0,
            description = 'በካሮት፣ አተርና ድንች የተጠበሰ ጣፋጭ ሩዝ / Aromatic fried rice tossed with seasoned garden vegetables',
            image_url = 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ሩዝ በአትክልት';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ሩዝ በአትክልት', 'የጾም ምሳ', 360.0, 210.0, 'በካሮት፣ አተርና ድንች የተጠበሰ ጣፋጭ ሩዝ / Aromatic fried rice tossed with seasoned garden vegetables', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'እንቁላል በስጋ') THEN
        UPDATE public.products
        SET category = 'የፍስክ ቁርስ',
            selling_price = 320.0,
            cost_price = 190.0,
            description = 'በደቀቀ ስጋና ቅመም የተቁላላ እንቁላል / Farm eggs scrambled with seasoned minced beef, tomatoes, and peppers',
            image_url = 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'እንቁላል በስጋ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'እንቁላል በስጋ', 'የፍስክ ቁርስ', 320.0, 190.0, 'በደቀቀ ስጋና ቅመም የተቁላላ እንቁላል / Farm eggs scrambled with seasoned minced beef, tomatoes, and peppers', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ፓስታ በእንቁላል') THEN
        UPDATE public.products
        SET category = 'የፍስክ ቁርስ',
            selling_price = 320.0,
            cost_price = 180.0,
            description = 'በእንቁላል የተጠበሰ ሞቅ ያለ ፓስታ / Warm spaghetti tossed with seasoned scrambled eggs and light herb sauce',
            image_url = 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ፓስታ በእንቁላል';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ፓስታ በእንቁላል', 'የፍስክ ቁርስ', 320.0, 180.0, 'በእንቁላል የተጠበሰ ሞቅ ያለ ፓስታ / Warm spaghetti tossed with seasoned scrambled eggs and light herb sauce', 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'እንቁላል ፍርፍር') THEN
        UPDATE public.products
        SET category = 'የፍስክ ቁርስ',
            selling_price = 210.0,
            cost_price = 120.0,
            description = 'በሽንኩርት፣ ቲማቲምና ቃሪያ የተጠበሰ እንቁላል / Classic scrambled eggs with onions, tomatoes, and fresh jalapeños',
            image_url = 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'እንቁላል ፍርፍር';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'እንቁላል ፍርፍር', 'የፍስክ ቁርስ', 210.0, 120.0, 'በሽንኩርት፣ ቲማቲምና ቃሪያ የተጠበሰ እንቁላል / Classic scrambled eggs with onions, tomatoes, and fresh jalapeños', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'እንቁላል ስልስ') THEN
        UPDATE public.products
        SET category = 'የፍስክ ቁርስ',
            selling_price = 240.0,
            cost_price = 140.0,
            description = 'በበርበሬና ሽንኩርት ስጎ የበሰለ እንቁላል / Eggs gently poached in rich berbere-onion sauce reduction',
            image_url = 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'እንቁላል ስልስ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'እንቁላል ስልስ', 'የፍስክ ቁርስ', 240.0, 140.0, 'በበርበሬና ሽንኩርት ስጎ የበሰለ እንቁላል / Eggs gently poached in rich berbere-onion sauce reduction', 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'እንቁላል ሳንድዊች') THEN
        UPDATE public.products
        SET category = 'የፍስክ ቁርስ',
            selling_price = 180.0,
            cost_price = 100.0,
            description = 'በትኩስ ዳቦ የተዘጋጀ የእንቁላል ሳንድዊች / Fluffy seasoned egg omelette inside crusty fresh baguette',
            image_url = 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'እንቁላል ሳንድዊች';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'እንቁላል ሳንድዊች', 'የፍስክ ቁርስ', 180.0, 100.0, 'በትኩስ ዳቦ የተዘጋጀ የእንቁላል ሳንድዊች / Fluffy seasoned egg omelette inside crusty fresh baguette', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ዱለት') THEN
        UPDATE public.products
        SET category = 'የፍስክ ቁርስ',
            selling_price = 360.0,
            cost_price = 220.0,
            description = 'በቅቤ፣ በሚጥሚጣና ሽንኩርት የተዘጋጀ ባህላዊ ዱለት / Minced tripe, liver, and lean beef sauteed with spiced butter & mitmita',
            image_url = 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ዱለት';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ዱለት', 'የፍስክ ቁርስ', 360.0, 220.0, 'በቅቤ፣ በሚጥሚጣና ሽንኩርት የተዘጋጀ ባህላዊ ዱለት / Minced tripe, liver, and lean beef sauteed with spiced butter & mitmita', 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ስፔሻል ዱለት') THEN
        UPDATE public.products
        SET category = 'የፍስክ ቁርስ',
            selling_price = 400.0,
            cost_price = 250.0,
            description = 'በንጥር ቅቤ እና በተመረጠ ስጋ የተዘጋጀ ስፔሻል ዱለት / Premium dulet cooked with extra niter kibbeh and fresh herbs',
            image_url = 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ስፔሻል ዱለት';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ስፔሻል ዱለት', 'የፍስክ ቁርስ', 400.0, 250.0, 'በንጥር ቅቤ እና በተመረጠ ስጋ የተዘጋጀ ስፔሻል ዱለት / Premium dulet cooked with extra niter kibbeh and fresh herbs', 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ምላስ በሽንበር') THEN
        UPDATE public.products
        SET category = 'የፍስክ ቁርስ',
            selling_price = 300.0,
            cost_price = 180.0,
            description = 'የበሰለ የበሬ ምላስ በሽንብራ ወጥ ተዘጋጅቶ / Tender braised beef tongue simmered in spiced chickpea gravy',
            image_url = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ምላስ በሽንበር';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ምላስ በሽንበር', 'የፍስክ ቁርስ', 300.0, 180.0, 'የበሰለ የበሬ ምላስ በሽንብራ ወጥ ተዘጋጅቶ / Tender braised beef tongue simmered in spiced chickpea gravy', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ቂንጬ በእንቁላል') THEN
        UPDATE public.products
        SET category = 'የፍስክ ቁርስ',
            selling_price = 280.0,
            cost_price = 160.0,
            description = 'በቅቤና በእንቁላል የተዘጋጀ የቂንጬ ቁርስ / Cracked wheat porridge infused with seasoned scrambled eggs and butter',
            image_url = 'https://images.unsplash.com/photo-1586511925508-a4c6a7234978?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ቂንጬ በእንቁላል';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ቂንጬ በእንቁላል', 'የፍስክ ቁርስ', 280.0, 160.0, 'በቅቤና በእንቁላል የተዘጋጀ የቂንጬ ቁርስ / Cracked wheat porridge infused with seasoned scrambled eggs and butter', 'https://images.unsplash.com/photo-1586511925508-a4c6a7234978?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ቂንጬ በቅቤ') THEN
        UPDATE public.products
        SET category = 'የፍስክ ቁርስ',
            selling_price = 250.0,
            cost_price = 140.0,
            description = 'በንጥር የሀበሻ ቅቤ የተዘጋጀ ልስላሴ ያለው ቂንጬ / Cracked wheat simmered soft and enriched with spiced clarified butter',
            image_url = 'https://images.unsplash.com/photo-1586511925508-a4c6a7234978?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ቂንጬ በቅቤ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ቂንጬ በቅቤ', 'የፍስክ ቁርስ', 250.0, 140.0, 'በንጥር የሀበሻ ቅቤ የተዘጋጀ ልስላሴ ያለው ቂንጬ / Cracked wheat simmered soft and enriched with spiced clarified butter', 'https://images.unsplash.com/photo-1586511925508-a4c6a7234978?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ስፔሻል ፉል') THEN
        UPDATE public.products
        SET category = 'የፍስክ ቁርስ',
            selling_price = 250.0,
            cost_price = 150.0,
            description = 'በእንቁላል፣ ቅቤ እና አይብ የተደገፈ ስፔሻል ፉል / Fava beans topped with scrambled egg, spiced butter, and fresh cheese',
            image_url = 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ስፔሻል ፉል';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ስፔሻል ፉል', 'የፍስክ ቁርስ', 250.0, 150.0, 'በእንቁላል፣ ቅቤ እና አይብ የተደገፈ ስፔሻል ፉል / Fava beans topped with scrambled egg, spiced butter, and fresh cheese', 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ፓንኬክ') THEN
        UPDATE public.products
        SET category = 'የፍስክ ቁርስ',
            selling_price = 200.0,
            cost_price = 100.0,
            description = 'ሞቅ ያለ ለስላሳ ፓንኬክ በማር / Freshly prepared golden fluffy pancakes served warm with honey',
            image_url = 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ፓንኬክ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ፓንኬክ', 'የፍስክ ቁርስ', 200.0, 100.0, 'ሞቅ ያለ ለስላሳ ፓንኬክ በማር / Freshly prepared golden fluffy pancakes served warm with honey', 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ቡላ ገንፎ በውሃ') THEN
        UPDATE public.products
        SET category = 'የፍስክ ቁርስ',
            selling_price = 230.0,
            cost_price = 130.0,
            description = 'ባህላዊ የቡላ ገንፎ በቅቤና በሚጥሚጣ / Traditional false banana porridge served with a pool of spiced butter & berbere',
            image_url = 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ቡላ ገንፎ በውሃ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ቡላ ገንፎ በውሃ', 'የፍስክ ቁርስ', 230.0, 130.0, 'ባህላዊ የቡላ ገንፎ በቅቤና በሚጥሚጣ / Traditional false banana porridge served with a pool of spiced butter & berbere', 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ቡላ ገንፎ በወተት') THEN
        UPDATE public.products
        SET category = 'የፍስክ ቁርስ',
            selling_price = 290.0,
            cost_price = 170.0,
            description = 'በወተት የበሰለ ለስላሳ የቡላ ገንፎ በንጥር ቅቤ / Rich bula porridge cooked with fresh milk and pure niter kibbeh',
            image_url = 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ቡላ ገንፎ በወተት';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ቡላ ገንፎ በወተት', 'የፍስክ ቁርስ', 290.0, 170.0, 'በወተት የበሰለ ለስላሳ የቡላ ገንፎ በንጥር ቅቤ / Rich bula porridge cooked with fresh milk and pure niter kibbeh', 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ቡላ ገንፎ በዱለት') THEN
        UPDATE public.products
        SET category = 'የፍስክ ቁርስ',
            selling_price = 460.0,
            cost_price = 280.0,
            description = 'በትኩስ የቅቤ ዱለት ያሸበረቀ ልዩ የቡላ ገንፎ / Specialty warm bula porridge topped with freshly cooked savory dulet',
            image_url = 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ቡላ ገንፎ በዱለት';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ቡላ ገንፎ በዱለት', 'የፍስክ ቁርስ', 460.0, 280.0, 'በትኩስ የቅቤ ዱለት ያሸበረቀ ልዩ የቡላ ገንፎ / Specialty warm bula porridge topped with freshly cooked savory dulet', 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ጎመን በስጋ') THEN
        UPDATE public.products
        SET category = 'የፍስክ ቁርስ',
            selling_price = 350.0,
            cost_price = 210.0,
            description = 'በለስላሳ ስጋ፣ በነጭ ሽንኩርትና ቅቤ የበሰለ ጎመን / Collard greens slow simmered with tender beef chunks and garlic butter',
            image_url = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ጎመን በስጋ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ጎመን በስጋ', 'የፍስክ ቁርስ', 350.0, 210.0, 'በለስላሳ ስጋ፣ በነጭ ሽንኩርትና ቅቤ የበሰለ ጎመን / Collard greens slow simmered with tender beef chunks and garlic butter', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ድግስ') THEN
        UPDATE public.products
        SET category = 'የፍስክ ምሳ',
            selling_price = 910.0,
            cost_price = 580.0,
            description = 'ጥብስ፣ ቀይ ወጥ፣ አልጫ እና ልዩ ልዩ ምግቦች የያዘ ትልቅ ድግስ / Ultimate royal feast platter with sizzling tibs, stews, and sides',
            image_url = 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ድግስ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ድግስ', 'የፍስክ ምሳ', 910.0, 580.0, 'ጥብስ፣ ቀይ ወጥ፣ አልጫ እና ልዩ ልዩ ምግቦች የያዘ ትልቅ ድግስ / Ultimate royal feast platter with sizzling tibs, stews, and sides', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ጥብስ') THEN
        UPDATE public.products
        SET category = 'የፍስክ ምሳ',
            selling_price = 560.0,
            cost_price = 340.0,
            description = 'በሽንኩርት፣ ሮዝመሪና ቃሪያ የተጠበሰ የፍሬሽ የበሬ ጥብስ / Tender cubed beef pan-fried with onions, rosemary, and green chillies',
            image_url = 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ጥብስ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ጥብስ', 'የፍስክ ምሳ', 560.0, 340.0, 'በሽንኩርት፣ ሮዝመሪና ቃሪያ የተጠበሰ የፍሬሽ የበሬ ጥብስ / Tender cubed beef pan-fried with onions, rosemary, and green chillies', 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ቅቀል') THEN
        UPDATE public.products
        SET category = 'የፍስክ ምሳ',
            selling_price = 550.0,
            cost_price = 330.0,
            description = 'በእርድና ዝንጅብል መረቅ የበሰለ የበሬ ስጋ ቅቀል / Bone-in beef slowly simmered in rich golden turmeric-ginger broth',
            image_url = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ቅቀል';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ቅቀል', 'የፍስክ ምሳ', 550.0, 330.0, 'በእርድና ዝንጅብል መረቅ የበሰለ የበሬ ስጋ ቅቀል / Bone-in beef slowly simmered in rich golden turmeric-ginger broth', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ጥብስ ፍርፍር') THEN
        UPDATE public.products
        SET category = 'የፍስክ ምሳ',
            selling_price = 400.0,
            cost_price = 240.0,
            description = 'በጣፋጭ የበሬ ጥብስ የተዘጋጀ ሞቅ ያለ ፍርፍር / Savory beef tibs simmered in berbere sauce and folded with injera',
            image_url = 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ጥብስ ፍርፍር';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ጥብስ ፍርፍር', 'የፍስክ ምሳ', 400.0, 240.0, 'በጣፋጭ የበሬ ጥብስ የተዘጋጀ ሞቅ ያለ ፍርፍር / Savory beef tibs simmered in berbere sauce and folded with injera', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ቋንጣ ፍርፍር') THEN
        UPDATE public.products
        SET category = 'የፍስክ ምሳ',
            selling_price = 400.0,
            cost_price = 240.0,
            description = 'በደረቀ የቋንጣ ስጋና በቅመም የተቁላላ ፍርፍር / Air-dried cured beef strips cooked in spicy sauce tossed with injera',
            image_url = 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ቋንጣ ፍርፍር';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ቋንጣ ፍርፍር', 'የፍስክ ምሳ', 400.0, 240.0, 'በደረቀ የቋንጣ ስጋና በቅመም የተቁላላ ፍርፍር / Air-dried cured beef strips cooked in spicy sauce tossed with injera', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ስጋ ፍርፍር') THEN
        UPDATE public.products
        SET category = 'የፍስክ ምሳ',
            selling_price = 350.0,
            cost_price = 210.0,
            description = 'በስጋ መረቅና በርበሬ የበሰለ የኢንጀራ ፍርፍር / Tender chopped beef folded with soft shredded injera in rich sauce',
            image_url = 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ስጋ ፍርፍር';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ስጋ ፍርፍር', 'የፍስክ ምሳ', 350.0, 210.0, 'በስጋ መረቅና በርበሬ የበሰለ የኢንጀራ ፍርፍር / Tender chopped beef folded with soft shredded injera in rich sauce', 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ምንቸት') THEN
        UPDATE public.products
        SET category = 'የፍስክ ምሳ',
            selling_price = 350.0,
            cost_price = 210.0,
            description = 'የደቀቀ የበሬ ስጋ በበርበሬና አብሽ የበሰለ ወጥ / Finely minced beef stew slow simmered with berbere and fenugreek spices',
            image_url = 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ምንቸት';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ምንቸት', 'የፍስክ ምሳ', 350.0, 210.0, 'የደቀቀ የበሬ ስጋ በበርበሬና አብሽ የበሰለ ወጥ / Finely minced beef stew slow simmered with berbere and fenugreek spices', 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ቀይወጥ') THEN
        UPDATE public.products
        SET category = 'የፍስክ ምሳ',
            selling_price = 320.0,
            cost_price = 190.0,
            description = 'ባህላዊ የበሬ ስጋ ቀይ ወጥ በበርበሬ / Traditional spicy beef red stew cooked with caramelized onions',
            image_url = 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ቀይወጥ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ቀይወጥ', 'የፍስክ ምሳ', 320.0, 190.0, 'ባህላዊ የበሬ ስጋ ቀይ ወጥ በበርበሬ / Traditional spicy beef red stew cooked with caramelized onions', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ቀይ ወጥ በእርጎ') THEN
        UPDATE public.products
        SET category = 'የፍስክ ምሳ',
            selling_price = 370.0,
            cost_price = 220.0,
            description = 'የበሬ ቀይ ወጥ ከትኩስ የቤት እርጎ ጋር / Spicy beef qey wot served with cooling authentic fresh curd yogurt',
            image_url = 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ቀይ ወጥ በእርጎ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ቀይ ወጥ በእርጎ', 'የፍስክ ምሳ', 370.0, 220.0, 'የበሬ ቀይ ወጥ ከትኩስ የቤት እርጎ ጋር / Spicy beef qey wot served with cooling authentic fresh curd yogurt', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ቦዘና') THEN
        UPDATE public.products
        SET category = 'የፍስክ ምሳ',
            selling_price = 320.0,
            cost_price = 190.0,
            description = 'በደቀቀ ስጋ የተቁላላ ልዩ የቦዘና ሽሮ / Signature clay-pot chickpea shiro simmered with savory minced beef',
            image_url = 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ቦዘና';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ቦዘና', 'የፍስክ ምሳ', 320.0, 190.0, 'በደቀቀ ስጋ የተቁላላ ልዩ የቦዘና ሽሮ / Signature clay-pot chickpea shiro simmered with savory minced beef', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ሽሮ በቅቤ') THEN
        UPDATE public.products
        SET category = 'የፍስክ ምሳ',
            selling_price = 300.0,
            cost_price = 180.0,
            description = 'በንጥር የሀበሻ ቅቤ የተዘጋጀ ልስላሴ ያለው ሽሮ / Authentic shiro enriched with aromatic spiced clarified butter',
            image_url = 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ሽሮ በቅቤ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ሽሮ በቅቤ', 'የፍስክ ምሳ', 300.0, 180.0, 'በንጥር የሀበሻ ቅቤ የተዘጋጀ ልስላሴ ያለው ሽሮ / Authentic shiro enriched with aromatic spiced clarified butter', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ሽሮ በእንቁላል') THEN
        UPDATE public.products
        SET category = 'የፍስክ ምሳ',
            selling_price = 320.0,
            cost_price = 190.0,
            description = 'በእንቁላል የተዘጋጀ ጣፋጭ የሽሮ ወጥ / Savory chickpea shiro stew enriched with simmered egg',
            image_url = 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ሽሮ በእንቁላል';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ሽሮ በእንቁላል', 'የፍስክ ምሳ', 320.0, 190.0, 'በእንቁላል የተዘጋጀ ጣፋጭ የሽሮ ወጥ / Savory chickpea shiro stew enriched with simmered egg', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ሽሮ በቋንጣ') THEN
        UPDATE public.products
        SET category = 'የፍስክ ምሳ',
            selling_price = 320.0,
            cost_price = 190.0,
            description = 'በጣፋጭ የቋንጣ ስጋ የተዘጋጀ ልዩ ሽሮ / Classic bubbling shiro slow-cooked with air-dried jerky beef',
            image_url = 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ሽሮ በቋንጣ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ሽሮ በቋንጣ', 'የፍስክ ምሳ', 320.0, 190.0, 'በጣፋጭ የቋንጣ ስጋ የተዘጋጀ ልዩ ሽሮ / Classic bubbling shiro slow-cooked with air-dried jerky beef', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ፓስታ በስጋ') THEN
        UPDATE public.products
        SET category = 'የፍስክ ምሳ',
            selling_price = 350.0,
            cost_price = 210.0,
            description = 'በስጋ ስጎ የተዘጋጀ ጣፋጭ ፓስታ / Spaghetti served with savory minced beef bolognese-style sauce',
            image_url = 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ፓስታ በስጋ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ፓስታ በስጋ', 'የፍስክ ምሳ', 350.0, 210.0, 'በስጋ ስጎ የተዘጋጀ ጣፋጭ ፓስታ / Spaghetti served with savory minced beef bolognese-style sauce', 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ሩዝ በቺክን') THEN
        UPDATE public.products
        SET category = 'የፍስክ ምሳ',
            selling_price = 450.0,
            cost_price = 270.0,
            description = 'በጣፋጭ የዶሮ ስጋ የተጠበሰ ሩዝ / Fragrant spiced rice served with seasoned tender chicken cuts',
            image_url = 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ሩዝ በቺክን';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ሩዝ በቺክን', 'የፍስክ ምሳ', 450.0, 270.0, 'በጣፋጭ የዶሮ ስጋ የተጠበሰ ሩዝ / Fragrant spiced rice served with seasoned tender chicken cuts', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ሩዝ በስጋ') THEN
        UPDATE public.products
        SET category = 'የፍስክ ምሳ',
            selling_price = 400.0,
            cost_price = 240.0,
            description = 'በለስላሳ የበሬ ስጋ የተጠበሰ ጣፋጭ ሩዝ / Fragrant seasoned rice topped with juicy sauteed beef and onions',
            image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ሩዝ በስጋ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ሩዝ በስጋ', 'የፍስክ ምሳ', 400.0, 240.0, 'በለስላሳ የበሬ ስጋ የተጠበሰ ጣፋጭ ሩዝ / Fragrant seasoned rice topped with juicy sauteed beef and onions', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ለስላሳ/አምቦ') THEN
        UPDATE public.products
        SET category = 'መጠጦች',
            selling_price = 60.0,
            cost_price = 40.0,
            description = 'ቀዝቃዛ ኮካ፣ ፋንታ፣ ስፕራይት ወይም አምቦ ዉሃ / Chilled soft drink (Coca-Cola/Sprite/Fanta) or sparkling Ambo water',
            image_url = 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ለስላሳ/አምቦ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ለስላሳ/አምቦ', 'መጠጦች', 60.0, 40.0, 'ቀዝቃዛ ኮካ፣ ፋንታ፣ ስፕራይት ወይም አምቦ ዉሃ / Chilled soft drink (Coca-Cola/Sprite/Fanta) or sparkling Ambo water', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = '2 ሊትር ውሃ') THEN
        UPDATE public.products
        SET category = 'መጠጦች',
            selling_price = 70.0,
            cost_price = 45.0,
            description = 'ንፁህ የታሸገ የሁለት ሊትር ውሃ / 2-liter pure bottled mineral spring water',
            image_url = 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = '2 ሊትር ውሃ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, '2 ሊትር ውሃ', 'መጠጦች', 70.0, 45.0, 'ንፁህ የታሸገ የሁለት ሊትር ውሃ / 2-liter pure bottled mineral spring water', 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = '1 ሊትር ውሃ') THEN
        UPDATE public.products
        SET category = 'መጠጦች',
            selling_price = 50.0,
            cost_price = 30.0,
            description = 'ንፁህ የታሸገ የአንድ ሊትር ውሃ / 1-liter pure bottled mineral spring water',
            image_url = 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = '1 ሊትር ውሃ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, '1 ሊትር ውሃ', 'መጠጦች', 50.0, 30.0, 'ንፁህ የታሸገ የአንድ ሊትር ውሃ / 1-liter pure bottled mineral spring water', 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = '1/2 ሊትር ውሃ') THEN
        UPDATE public.products
        SET category = 'መጠጦች',
            selling_price = 40.0,
            cost_price = 25.0,
            description = 'ንፁህ የታሸገ የግማሽ ሊትር ውሃ / 500ml pure bottled mineral spring water',
            image_url = 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = '1/2 ሊትር ውሃ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, '1/2 ሊትር ውሃ', 'መጠጦች', 40.0, 25.0, 'ንፁህ የታሸገ የግማሽ ሊትር ውሃ / 500ml pure bottled mineral spring water', 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'አንደኛ ማልት') THEN
        UPDATE public.products
        SET category = 'መጠጦች',
            selling_price = 90.0,
            cost_price = 60.0,
            description = 'ቀዝቃዛ አንደኛ ማልት መጠጥ / Refreshing cold non-alcoholic brewed malt drink',
            image_url = 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'አንደኛ ማልት';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'አንደኛ ማልት', 'መጠጦች', 90.0, 60.0, 'ቀዝቃዛ አንደኛ ማልት መጠጥ / Refreshing cold non-alcoholic brewed malt drink', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ቡና') THEN
        UPDATE public.products
        SET category = 'ትኩስ ነገሮች',
            selling_price = 40.0,
            cost_price = 15.0,
            description = 'በባህላዊ ጀበና የተፈላ ትኩስ ሀበሻ ቡና / Authentic freshly brewed traditional jebena Ethiopian coffee',
            image_url = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ቡና';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ቡና', 'ትኩስ ነገሮች', 40.0, 15.0, 'በባህላዊ ጀበና የተፈላ ትኩስ ሀበሻ ቡና / Authentic freshly brewed traditional jebena Ethiopian coffee', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ሻይ') THEN
        UPDATE public.products
        SET category = 'ትኩስ ነገሮች',
            selling_price = 30.0,
            cost_price = 10.0,
            description = 'በቀረፋና በቁንዶ በርበሬ የተፈላ ትኩስ ሻይ / Fragrant hot black tea spiced with cinnamon and cloves',
            image_url = 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ሻይ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ሻይ', 'ትኩስ ነገሮች', 30.0, 10.0, 'በቀረፋና በቁንዶ በርበሬ የተፈላ ትኩስ ሻይ / Fragrant hot black tea spiced with cinnamon and cloves', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ለዉዝ') THEN
        UPDATE public.products
        SET category = 'ትኩስ ነገሮች',
            selling_price = 60.0,
            cost_price = 25.0,
            description = 'ጣፋጭና ሞቅ ያለ የለዉዝ ትኩስ መጠጥ / Warm comforting sweetened roasted peanut hot drink',
            image_url = 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ለዉዝ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ለዉዝ', 'ትኩስ ነገሮች', 60.0, 25.0, 'ጣፋጭና ሞቅ ያለ የለዉዝ ትኩስ መጠጥ / Warm comforting sweetened roasted peanut hot drink', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ቀሽር') THEN
        UPDATE public.products
        SET category = 'ትኩስ ነገሮች',
            selling_price = 40.0,
            cost_price = 15.0,
            description = 'በዝንጅብልና በቅመማ ቅመም የተፈላ ባህላዊ ቀሽር / Traditional spiced coffee husk herbal tea with ginger',
            image_url = 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ቀሽር';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ቀሽር', 'ትኩስ ነገሮች', 40.0, 15.0, 'በዝንጅብልና በቅመማ ቅመም የተፈላ ባህላዊ ቀሽር / Traditional spiced coffee husk herbal tea with ginger', 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.products WHERE restaurant_id = v_restaurant_id AND name = 'ስፕሪስ') THEN
        UPDATE public.products
        SET category = 'ትኩስ ነገሮች',
            selling_price = 40.0,
            cost_price = 15.0,
            description = 'ግማሽ ሻይ እና ግማሽ ቡና በአንድ ሲኒ / Distinctive half tea and half coffee layered hot beverage',
            image_url = 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
            active = true,
            updated_at = now()
        WHERE restaurant_id = v_restaurant_id AND name = 'ስፕሪስ';
    ELSE
        INSERT INTO public.products (
            restaurant_id, name, category, selling_price, cost_price, description, image_url, active
        ) VALUES (
            v_restaurant_id, 'ስፕሪስ', 'ትኩስ ነገሮች', 40.0, 15.0, 'ግማሽ ሻይ እና ግማሽ ቡና በአንድ ሲኒ / Distinctive half tea and half coffee layered hot beverage', 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80', true
        );
    END IF;

    RAISE NOTICE 'Menu successfully seeded with 63 items for restaurant %', v_restaurant_id;
END $$;
