#!/usr/bin/ruby

# TODO:
# - qualifier "um", "ca", "?", ... auswerten
# - Granularität auf Tag ausweiten

require 'csv'

class Point

	attr_accessor :time, :fuzziness

	def initialize(time, fuzziness = 0)
		@time = time
		@fuzziness = fuzziness
	end

	def to_s()
		"{ time: #{@time}, fuzziness: #{@fuzziness} }"
	end

end

class Period
	
	attr_accessor :start, :end

	def initialize(start, ennd = nil)
		@start = start
		@end = ennd
	end

	def to_s()
		"[#{self.start}:#{self.end}]"
	end

end

def cleanDateField(value)
	value.gsub(/[–\/]/,'-').gsub(/\s/,'')
end

def createPoint(jh, zeitraum, vn)
	return nil if jh == nil
	zeitraum.strip! if zeitraum != nil
	zeitraum = "10. Jahrzehnt" if zeitraum == "letztes Jahrzehnt"
	zeitraum = "4. Viertel" if zeitraum == "letztes Viertel"
	zeitraum = "3. Drittel" if zeitraum == "letztes Drittel"
	zeitraum = "1. Drittel" if ["Anfang","frühes","Anfang/frühes","früheres"].include? zeitraum 
	zeitraum = "2. Drittel" if zeitraum == "Mitte"
	zeitraum = "3. Drittel" if ["Ende","spätes","Ende/spätes","späteres"].include? zeitraum 
	if zeitraum =~ /(\d+)\.?\s+(\w+)/
		zr_factor, zr_word = zeitraum.gsub(/(\d+)\.?\s+(\w+)/,'\1 \2').split
		zr_factor = zr_factor.to_i
		zr_base = case zr_word
			when "Jzehnt", "Jahrzehnt" then 10
			when "Viertel" then 25
			when "Drittel" then 33
			when "Hälfte" then 50
			else
				raise "Error while parsing Zeitraum: #{zeitraum}"
				return nil
		end
	elsif zeitraum == "" || zeitraum == nil
		zr_base = 100
		zr_factor = 1
	else
		raise "Error while parsing Zeitraum: #{zeitraum.inspect}"
		return nil
	end
		#puts "jh, #{jh}, zr_factor: #{zr_factor}, zr_base: #{zr_base}"
		zr_years = zr_factor * zr_base - zr_base / 2
		if vn == "v. Chr."
			jh = 0 - jh.to_i
		else
			jh = jh.to_i - 1
		end
		time = Date.new(jh * 100 + zr_years)
		fuzziness = Date.new(zr_base)
		return Point.new(time, zr_base)	
end

count = 0

CSV.foreach(ARGV[0], {:headers => true, :col_sep => '@'}) do |row|

	#break if (count += 1) > 100 

	#puts "Processing: #{row}"

	begin

		if row['AnfPraezise']
			anfang = cleanDateField(row['AnfPraezise'])
			if anfang =~ /[0-9]+-[0-9]+/
				anfang_ende = anfang.split('-')
		  	anfang = anfang_ende[0]
		  	ende = anfang_ende[1]
		  else
		  	if row['AnfPraezise']
		  		anfang = cleanDateField(row['AnfPraezise'])
		  	else
		  		anfang = nil
		  	end
		  	if row['EndPraezise']
		  		ende = cleanDateField(row['EndPraezise'])
		  	else
		  		ende = nil
		  	end
			end
			factor = row['AnfDatvn'] == "v. Chr." ? -1 : 1 
			if anfang == nil && ende == nil
				puts "Warning: No date to normalize"
				next
			elsif ende == nil
				start_point = Point.new(Date.new(anfang.to_i * factor), 1)
				end_point = nil
			elsif anfang == nil
				start_point = Point.new(Date.new(ende.to_i * factor), 1)
				end_point = nil
			else
				start_point = Point.new(Date.new(anfang.to_i * factor), 1)
				end_point = Point.new(Date.new(ende.to_i * factor), 1)
			end
			p = Period.new(start_point, end_point)
		elsif row['AnfDatJh']
			jh_anfang = cleanDateField(row['AnfDatJh'])
			if jh_anfang =~ /[0-9]+-[0-9]+/
				anfang_ende = jh_anfang.split('-')
		  	jh_anfang = anfang_ende[0]
		  	jh_ende = anfang_ende[1]
			elsif row['EndDatJh']
				jh_ende = cleanDateField(row['EndDatJh'])
			else
				jh_ende = nil
			end
			start_point = createPoint(jh_anfang, row['AnfDatZeitraum'], row['AnfDatvn'])
			end_point = createPoint(jh_ende, row['EndDatZeitraum'], row['EndDatvn'])
			if end_point
				p = Period.new(start_point, end_point)
			else
				p = Period.new(start_point)
			end
		end

	rescue => e
		#puts e.message
	end

  row.push(p.start.time.year.to_s) if p && p.start
  row.push(p.end.time.year.to_s) if p && p.end
  puts row.to_s

end